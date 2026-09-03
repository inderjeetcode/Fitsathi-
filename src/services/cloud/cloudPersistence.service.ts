import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { cloudAuthService } from './cloudAuth.service';

export interface CloudResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  isOffline?: boolean;
  isCloudAuthenticated?: boolean;
}

/**
 * Cloud Persistence Foundation Layer
 * Safe abstraction for Supabase cloud queries.
 * Ensures:
 * 1. Cloud writes are attempted only when a valid Supabase Auth session exists.
 * 2. Every cloud write/query uses the authenticated user's real UUID (auth.uid()).
 * 3. Never throws unhandled exceptions; returns safe CloudResult structures.
 * 4. Local operations never block if the cloud fails or is offline.
 */
class CloudPersistenceService {
  /**
   * Safe wrapper to execute any Supabase operation with automatic auth and network checks.
   */
  async executeOperation<T>(
    operationName: string,
    operation: (client: NonNullable<typeof supabase>, userId: string) => Promise<{ data: T | null; error: unknown }>
  ): Promise<CloudResult<T>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase is not configured',
        isOffline: true,
        isCloudAuthenticated: false
      };
    }

    const cloudUserId = await cloudAuthService.getCloudUserId();
    if (!cloudUserId) {
      return {
        success: false,
        error: 'Not authenticated with Supabase cloud',
        isOffline: false,
        isCloudAuthenticated: false
      };
    }

    try {
      const { data, error } = await operation(supabase, cloudUserId);
      if (error) {
        const errorMsg = typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Unknown cloud error';
        console.warn(`[CloudPersistence] Error during ${operationName}:`, errorMsg);
        return {
          success: false,
          error: errorMsg,
          isOffline: false,
          isCloudAuthenticated: true
        };
      }

      return {
        success: true,
        data: data ?? undefined,
        isCloudAuthenticated: true
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network or execution error';
      console.warn(`[CloudPersistence] Exception during ${operationName}:`, errorMsg);
      return {
        success: false,
        error: errorMsg,
        isOffline: true,
        isCloudAuthenticated: true
      };
    }
  }

  /**
   * Generic fetch helper for user-owned tables
   */
  async fetchUserRecords<T>(
    tableName: string,
    queryBuilder?: (query: any) => any
  ): Promise<CloudResult<T[]>> {
    return this.executeOperation<T[]>(`fetch:${tableName}`, async (client, userId) => {
      let query = client.from(tableName).select('*').eq('user_id', userId);
      if (queryBuilder) {
        query = queryBuilder(query);
      }
      return await query;
    });
  }

  /**
   * Generic single record upsert for user-owned tables
   * Automatically enforces user_id = authenticated cloudUserId
   */
  async upsertUserRecord<T extends { user_id?: string; id?: string }>(
    tableName: string,
    record: T
  ): Promise<CloudResult<T>> {
    return this.executeOperation<T>(`upsert:${tableName}`, async (client, userId) => {
      const recordWithAuthUser = {
        ...record,
        user_id: userId
      };
      return await client.from(tableName).upsert(recordWithAuthUser).select().single();
    });
  }

  /**
   * Generic delete helper for user-owned tables
   */
  async deleteUserRecord(
    tableName: string,
    recordId: string
  ): Promise<CloudResult<boolean>> {
    return this.executeOperation<boolean>(`delete:${tableName}`, async (client, userId) => {
      const { error } = await client
        .from(tableName)
        .delete()
        .eq('id', recordId)
        .eq('user_id', userId);

      return { data: !error, error };
    });
  }
}

export const cloudPersistenceService = new CloudPersistenceService();

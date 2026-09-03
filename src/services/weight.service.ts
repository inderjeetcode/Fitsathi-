import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { WeightLog } from '../types';
import { healthSyncService } from './cloud/healthSync.service';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const weightService = {
  async logWeight(
    userId: string,
    weightKg: number,
    notes?: string,
    date?: string
  ): Promise<WeightLog> {
    const logDate = date || getTodayDate();
    const newLog: WeightLog = {
      id: 'wt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      user_id: userId,
      weight_kg: weightKg,
      notes: notes || '',
      log_date: logDate,
      created_at: new Date().toISOString()
    };

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'weight_logs', newLog.id), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `weight_logs/${newLog.id}`);
      }
    }

    localDb.saveWeightLog(newLog);
    healthSyncService.triggerBackgroundSync();
    return newLog;
  },

  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const collRef = collection(db, 'weight_logs');
        const q = query(collRef, where('user_id', '==', userId));
        const snap = await getDocs(q);
        const logs: WeightLog[] = [];
        snap.forEach(d => {
          logs.push(d.data() as WeightLog);
        });
        if (logs.length > 0) {
          return logs;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'weight_logs');
      }
    }

    return localDb.getWeightLogs(userId);
  },

  async deleteWeight(id: string, userId: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await deleteDoc(doc(db, 'weight_logs', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `weight_logs/${id}`);
      }
    }
    localDb.deleteWeightLog(id, userId);
    healthSyncService.triggerBackgroundSync();
  },

  getWeightTrend(logs: WeightLog[]) {
    if (logs.length === 0) {
      return { currentWeight: 0, changeTotal: 0, initialWeight: 0, trend: 'neutral' as const };
    }
    const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
    const initial = sorted[0].weight_kg;
    const current = sorted[sorted.length - 1].weight_kg;
    const change = Math.round((current - initial) * 10) / 10;
    return {
      currentWeight: current,
      initialWeight: initial,
      changeTotal: change,
      trend: change < 0 ? ('loss' as const) : change > 0 ? ('gain' as const) : ('neutral' as const)
    };
  }
};

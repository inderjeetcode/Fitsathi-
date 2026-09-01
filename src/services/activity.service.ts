import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { ActivityLog } from '../types';

export const activityService = {
  async logActivity(
    userId: string,
    steps: number,
    activeMinutes: number,
    caloriesBurned: number,
    activityType?: string,
    notes?: string,
    date?: string
  ): Promise<ActivityLog> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const log: ActivityLog = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      steps,
      active_minutes: activeMinutes,
      calories_burned: caloriesBurned,
      activity_type: activityType || 'Walking / Workout',
      notes: notes || '',
      log_date: targetDate,
      created_at: new Date().toISOString()
    };

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'activity_logs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `activity_logs/${log.id}`);
      }
    }

    localDb.saveActivityLog(log);
    return log;
  },

  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const collRef = collection(db, 'activity_logs');
        const q = query(collRef, where('user_id', '==', userId));
        const snap = await getDocs(q);
        const logs: ActivityLog[] = [];
        snap.forEach(d => {
          logs.push(d.data() as ActivityLog);
        });
        if (logs.length > 0) {
          return logs;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'activity_logs');
      }
    }

    return localDb.getActivityLogs(userId);
  },

  async deleteActivity(id: string, userId: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await deleteDoc(doc(db, 'activity_logs', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `activity_logs/${id}`);
      }
    }
    localDb.deleteActivityLog(id, userId);
  },

  getTodayActivity(logs: ActivityLog[], date?: string): { steps: number; activeMinutes: number; caloriesBurned: number } {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.log_date === targetDate);
    
    return {
      steps: todayLogs.reduce((acc, curr) => acc + (curr.steps || 0), 0),
      activeMinutes: todayLogs.reduce((acc, curr) => acc + (curr.active_minutes || 0), 0),
      caloriesBurned: todayLogs.reduce((acc, curr) => acc + (curr.calories_burned || 0), 0)
    };
  }
};

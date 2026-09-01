import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { SleepLog } from '../types';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const sleepService = {
  calculateDurationMinutes(bedTime: string, wakeTime: string): number {
    const [bedH, bedM] = bedTime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    return Math.max(0, wakeMinutes - bedMinutes);
  },

  async logSleep(
    userId: string,
    bedTime: string,
    wakeTime: string,
    qualityRating: number = 4,
    notes?: string,
    date?: string
  ): Promise<SleepLog> {
    const logDate = date || getTodayDate();
    const duration = this.calculateDurationMinutes(bedTime, wakeTime);

    const newLog: SleepLog = {
      id: 'sl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      user_id: userId,
      bed_time: bedTime,
      wake_time: wakeTime,
      duration_minutes: duration,
      quality_rating: qualityRating,
      quality_score: qualityRating,
      notes: notes || '',
      log_date: logDate,
      created_at: new Date().toISOString()
    };

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'sleep_logs', newLog.id), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `sleep_logs/${newLog.id}`);
      }
    }

    localDb.saveSleepLog(newLog);
    return newLog;
  },

  async getSleepLogs(userId: string): Promise<SleepLog[]> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const collRef = collection(db, 'sleep_logs');
        const q = query(collRef, where('user_id', '==', userId));
        const snap = await getDocs(q);
        const logs: SleepLog[] = [];
        snap.forEach(d => {
          logs.push(d.data() as SleepLog);
        });
        if (logs.length > 0) {
          return logs;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'sleep_logs');
      }
    }

    return localDb.getSleepLogs(userId);
  },

  async deleteSleep(id: string, userId: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await deleteDoc(doc(db, 'sleep_logs', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `sleep_logs/${id}`);
      }
    }
    localDb.deleteSleepLog(id, userId);
  }
};

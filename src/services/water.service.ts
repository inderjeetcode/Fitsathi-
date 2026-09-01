import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { WaterLog } from '../types';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const waterService = {
  async getTodayWaterLogs(userId: string): Promise<WaterLog[]> {
    const today = getTodayDate();
    return this.getWaterLogs(userId, today);
  },

  async getWaterLogs(userId: string, date?: string): Promise<WaterLog[]> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const collRef = collection(db, 'water_logs');
        const q = date
          ? query(collRef, where('user_id', '==', userId), where('log_date', '==', date))
          : query(collRef, where('user_id', '==', userId));
        
        const snap = await getDocs(q);
        const logs: WaterLog[] = [];
        snap.forEach(d => {
          logs.push(d.data() as WaterLog);
        });
        if (logs.length > 0) {
          return logs;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'water_logs');
      }
    }

    return localDb.getWaterLogs(userId, date);
  },

  async addWater(userId: string, amountMl: number = 250, date?: string): Promise<WaterLog> {
    const logDate = date || getTodayDate();
    const newLog: WaterLog = {
      id: 'wl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      user_id: userId,
      amount_ml: amountMl,
      glasses: amountMl / 250,
      log_date: logDate,
      created_at: new Date().toISOString()
    };

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'water_logs', newLog.id), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `water_logs/${newLog.id}`);
      }
    }

    localDb.saveWaterLog(newLog);
    return newLog;
  },

  async deleteWater(id: string, userId: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await deleteDoc(doc(db, 'water_logs', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `water_logs/${id}`);
      }
    }
    localDb.deleteWaterLog(id, userId);
  },

  getDailyWaterTotal(logs: WaterLog[]) {
    const totalMl = logs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);
    const totalGlasses = Math.round((totalMl / 250) * 10) / 10;
    return {
      totalMl,
      totalGlasses
    };
  }
};

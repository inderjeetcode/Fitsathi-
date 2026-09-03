import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { DietPlan, DietPlanMeal } from '../types';
import { healthSyncService } from './cloud/healthSync.service';

export const dietService = {
  async getDietPlans(userId: string): Promise<DietPlan[]> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const collRef = collection(db, 'diet_plans');
        const q = query(collRef, where('user_id', '==', userId));
        const snap = await getDocs(q);
        const plans: DietPlan[] = [];
        snap.forEach(d => {
          plans.push(d.data() as DietPlan);
        });
        if (plans.length > 0) {
          return plans;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'diet_plans');
      }
    }

    return localDb.getDietPlans(userId);
  },

  async createDietPlan(plan: Omit<DietPlan, 'id' | 'created_at'>, userId: string): Promise<DietPlan> {
    const newPlan: DietPlan = {
      ...plan,
      id: 'dp-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      created_at: new Date().toISOString()
    };

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'diet_plans', newPlan.id), newPlan);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `diet_plans/${newPlan.id}`);
      }
    }

    localDb.saveDietPlan(newPlan);
    healthSyncService.triggerBackgroundSync();
    return newPlan;
  },

  async updateDietPlan(plan: DietPlan, userId: string): Promise<DietPlan> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'diet_plans', plan.id), plan);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `diet_plans/${plan.id}`);
      }
    }

    localDb.saveDietPlan(plan);
    healthSyncService.triggerBackgroundSync();
    return plan;
  },

  async deleteDietPlan(id: string, userId: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await deleteDoc(doc(db, 'diet_plans', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `diet_plans/${id}`);
      }
    }
    localDb.deleteDietPlan(id, userId);
    healthSyncService.triggerBackgroundSync();
  },

  calculatePlanTotals(meals: DietPlanMeal[]) {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;

    meals.forEach(m => {
      calories += m.calories || 0;
      protein += m.protein_g || 0;
      carbs += m.carbs_g || 0;
      fat += m.fat_g || 0;
      fiber += m.fiber_g || 0;
    });

    return {
      calories: Math.round(calories),
      protein_g: Number(protein.toFixed(1)),
      carbs_g: Number(carbs.toFixed(1)),
      fat_g: Number(fat.toFixed(1)),
      fiber_g: Number(fiber.toFixed(1))
    };
  }
};

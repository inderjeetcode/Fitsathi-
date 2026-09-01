import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { FoodLog, FoodItem, DailyNutritionSummary, MealType, UserProfile } from '../types';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const nutritionService = {
  async getTodayFoodLogs(userId: string): Promise<FoodLog[]> {
    const today = getTodayDate();
    return this.getFoodLogs(userId, today);
  },

  async getFoodLogs(userId: string, date?: string): Promise<FoodLog[]> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const collRef = collection(db, 'food_logs');
        const q = date
          ? query(collRef, where('user_id', '==', userId), where('log_date', '==', date))
          : query(collRef, where('user_id', '==', userId));
        
        const snap = await getDocs(q);
        const logs: FoodLog[] = [];
        snap.forEach(d => {
          logs.push(d.data() as FoodLog);
        });
        if (logs.length > 0) {
          return logs;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'food_logs');
      }
    }

    return localDb.getFoodLogs(userId, date);
  },

  calculateNutrition(food: FoodItem | { calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g?: number; serving_size?: number }, quantity: number) {
    const baseServing = (food.serving_size && food.serving_size > 0) ? food.serving_size : 1;
    const multiplier = quantity / baseServing;

    return {
      calories: Math.round(food.calories * multiplier),
      protein_g: Number((food.protein_g * multiplier).toFixed(1)),
      carbs_g: Number((food.carbs_g * multiplier).toFixed(1)),
      fat_g: Number((food.fat_g * multiplier).toFixed(1)),
      fiber_g: food.fiber_g ? Number((food.fiber_g * multiplier).toFixed(1)) : 0
    };
  },

  async logFood(
    food: FoodItem,
    quantity: number,
    mealType: MealType,
    userId: string,
    date?: string
  ): Promise<FoodLog> {
    const calculated = this.calculateNutrition(food, quantity);
    const logDate = date || getTodayDate();

    const newLog: FoodLog = {
      id: 'fl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      user_id: userId,
      food_id: food.id,
      food_name: food.name,
      meal_type: mealType,
      quantity,
      serving_unit: food.serving_unit || 'g',
      calories: calculated.calories,
      protein_g: calculated.protein_g,
      carbs_g: calculated.carbs_g,
      fat_g: calculated.fat_g,
      fiber_g: calculated.fiber_g,
      log_date: logDate,
      created_at: new Date().toISOString()
    };

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'food_logs', newLog.id), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `food_logs/${newLog.id}`);
      }
    }

    localDb.saveFoodLog(newLog);
    return newLog;
  },

  async deleteFoodLog(id: string, userId: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await deleteDoc(doc(db, 'food_logs', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `food_logs/${id}`);
      }
    }
    localDb.deleteFoodLog(id, userId);
  },

  async getDailySummary(userId: string, user: UserProfile, date?: string): Promise<DailyNutritionSummary> {
    const logs = await this.getFoodLogs(userId, date || getTodayDate());
    return this.calculateSummaryFromLogs(logs, user);
  },

  calculateSummaryFromLogs(logs: FoodLog[], user: UserProfile): DailyNutritionSummary {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;

    logs.forEach(log => {
      calories += log.calories || 0;
      protein += log.protein_g || 0;
      carbs += log.carbs_g || 0;
      fat += log.fat_g || 0;
      fiber += log.fiber_g || 0;
    });

    return {
      totalCalories: Math.round(calories),
      targetCalories: user.daily_calories_target || 2000,
      totalProtein: Number(protein.toFixed(1)),
      targetProtein: user.daily_protein_target || user.daily_protein_target_g || 100,
      totalCarbs: Number(carbs.toFixed(1)),
      targetCarbs: user.daily_carbs_target || user.daily_carbs_target_g || 250,
      totalFat: Number(fat.toFixed(1)),
      targetFat: user.daily_fat_target || user.daily_fat_target_g || 60,
      totalFiber: Number(fiber.toFixed(1)),
      mealsLoggedCount: logs.length
    };
  }
};

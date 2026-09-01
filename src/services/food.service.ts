import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { INITIAL_FOOD_DATABASE } from '../data/foods';
import { FoodItem, FoodCategory } from '../types';

export const foodService = {
  async getFoods(userId?: string, category: FoodCategory = 'all', searchQuery: string = ''): Promise<FoodItem[]> {
    const customList = userId ? await this.getCustomFoods(userId) : [];
    const allFoods = [...customList, ...INITIAL_FOOD_DATABASE];

    return allFoods.filter(item => {
      if (category !== 'all' && item.category !== category) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesHindi = item.hindi_name ? item.hindi_name.toLowerCase().includes(q) : false;
        const matchesCategory = item.category.toLowerCase().includes(q);
        return matchesName || matchesHindi || matchesCategory;
      }
      return true;
    });
  },

  async getCustomFoods(userId: string): Promise<FoodItem[]> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const collRef = collection(db, 'custom_foods');
        const q = query(collRef, where('user_id', '==', userId));
        const snap = await getDocs(q);
        const foods: FoodItem[] = [];
        snap.forEach(d => {
          foods.push(d.data() as FoodItem);
        });
        if (foods.length > 0) {
          return foods;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'custom_foods');
      }
    }

    return localDb.getCustomFoods(userId);
  },

  async addCustomFood(food: Omit<FoodItem, 'id' | 'created_at'>, userId: string): Promise<FoodItem> {
    const newFood: FoodItem = {
      ...food,
      id: 'cf-' + Math.random().toString(36).substring(2, 9),
      is_custom: true,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'custom_foods', newFood.id), newFood);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `custom_foods/${newFood.id}`);
      }
    }

    localDb.saveCustomFood(newFood);
    return newFood;
  },

  async updateCustomFood(food: FoodItem, userId: string): Promise<FoodItem> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'custom_foods', food.id), food);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `custom_foods/${food.id}`);
      }
    }

    localDb.saveCustomFood(food);
    return food;
  },

  async deleteCustomFood(foodId: string, userId: string): Promise<void> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await deleteDoc(doc(db, 'custom_foods', foodId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `custom_foods/${foodId}`);
      }
    }
    localDb.deleteCustomFood(foodId);
  }
};

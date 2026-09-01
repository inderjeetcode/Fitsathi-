import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navigation/Navbar';
import { Sidebar } from './components/Navigation/Sidebar';
import { BottomNav, NavTab } from './components/Navigation/BottomNav';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { WorkoutHistoryPage } from './pages/WorkoutHistoryPage';
import { PersonalRecordsPage } from './pages/PersonalRecordsPage';
import { ActiveWorkoutPage } from './pages/ActiveWorkoutPage';
import { RoutineBuilderPage } from './pages/RoutineBuilderPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { NutritionPage } from './pages/NutritionPage';
import { DietPlansPage } from './pages/DietPlansPage';
import { ActivityPage } from './pages/ActivityPage';
import { SleepPage } from './pages/SleepPage';
import { WaterPage } from './pages/WaterPage';
import { WeightPage } from './pages/WeightPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';

// Components & Modals
import { ActiveWorkoutBanner } from './components/Workout/ActiveWorkoutBanner';
import { AddFoodModal } from './components/Modals/AddFoodModal';
import { CustomFoodModal } from './components/Modals/CustomFoodModal';
import { AddWaterModal } from './components/Modals/AddWaterModal';
import { LogSleepModal } from './components/Modals/LogSleepModal';
import { LogWeightModal } from './components/Modals/LogWeightModal';
import { LogActivityModal } from './components/Modals/LogActivityModal';
import { CreateDietPlanModal } from './components/Modals/CreateDietPlanModal';

// Types & Services
import { 
  UserProfile, 
  FoodLog, 
  WaterLog, 
  SleepLog, 
  ActivityLog, 
  WeightLog, 
  DailyNutritionSummary, 
  MealType, 
  FoodItem,
  WorkoutRoutine,
  ActiveWorkoutState
} from './types';
import { auth, onAuthStateChanged } from './lib/firebase';
import { authService } from './services/auth.service';
import { profileService } from './services/profile.service';
import { nutritionService } from './services/nutrition.service';
import { waterService } from './services/water.service';
import { sleepService } from './services/sleep.service';
import { activityService } from './services/activity.service';
import { weightService } from './services/weight.service';
import { progressService, DailyDataPoint } from './services/progress.service';
import { workoutService } from './services/workout.service';
import { localDb } from './lib/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Application Data States
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [nutritionSummary, setNutritionSummary] = useState<DailyNutritionSummary>({
    totalCalories: 1650,
    targetCalories: 2200,
    totalProtein: 110,
    targetProtein: 120,
    totalCarbs: 185,
    targetCarbs: 250,
    totalFat: 50,
    targetFat: 65,
    totalFiber: 24,
    mealsLoggedCount: 4
  });
  const [progressData, setProgressData] = useState<DailyDataPoint[]>([]);
  const [progressDays, setProgressDays] = useState<number>(7);

  // Active Workout persistence state
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);

  // Modals Visibility
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [addFoodMealType, setAddFoodMealType] = useState<MealType>('breakfast');
  const [isCustomFoodOpen, setIsCustomFoodOpen] = useState(false);
  const [customFoodToEdit, setCustomFoodToEdit] = useState<FoodItem | null>(null);
  const [isAddWaterOpen, setIsAddWaterOpen] = useState(false);
  const [isLogSleepOpen, setIsLogSleepOpen] = useState(false);
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [isCreateDietPlanOpen, setIsCreateDietPlanOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  // Sync active workout status
  const checkActiveWorkout = useCallback(() => {
    if (!currentUser) {
      setActiveWorkout(null);
      return;
    }
    const current = workoutService.getActiveWorkout(currentUser.id);
    setActiveWorkout(current);
  }, [currentUser]);

  // Initialize Session
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const user = await authService.getCurrentUser();
      if (isMounted && user) {
        setCurrentUser(user);
        if (!user.onboarding_completed) {
          setIsOnboarding(true);
        }
      }
    }
    loadSession();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const user = await authService.getCurrentUser();
        if (isMounted && user) {
          setCurrentUser(user);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Fetch all user records whenever user changes or updates occur
  const refreshUserData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [foods, waters, sleeps, activities, weights, summary, prog] = await Promise.all([
        nutritionService.getTodayFoodLogs(currentUser.id),
        waterService.getTodayWaterLogs(currentUser.id),
        sleepService.getSleepLogs(currentUser.id),
        activityService.getActivityLogs(currentUser.id),
        weightService.getWeightLogs(currentUser.id),
        nutritionService.getDailySummary(currentUser.id, currentUser),
        progressService.getProgressSummary(currentUser.id, 90)
      ]);

      setFoodLogs(foods);
      setWaterLogs(waters);
      setSleepLogs(sleeps);
      setActivityLogs(activities);
      setWeightLogs(weights);
      setNutritionSummary(summary);
      setProgressData(prog);
      checkActiveWorkout();
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, [currentUser, checkActiveWorkout]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  useEffect(() => {
    checkActiveWorkout();
  }, [checkActiveWorkout, activeTab]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (!user.onboarding_completed) {
      setIsOnboarding(true);
    } else {
      setIsOnboarding(false);
    }
  };

  const handleOpenOnboarding = (user: UserProfile) => {
    setCurrentUser(user);
    setIsOnboarding(true);
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setIsOnboarding(false);
    setActiveTab('dashboard');
    refreshUserData();
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsOnboarding(false);
  };

  const handleSwitchUser = async (email: string) => {
    const user = await authService.login(email, '123456');
    setCurrentUser(user);
    setActiveTab('dashboard');
    refreshUserData();
  };

  // Quick Action Helpers
  const handleOpenAddFood = (mealType: MealType = 'breakfast') => {
    setAddFoodMealType(mealType);
    setIsAddFoodOpen(true);
  };

  const handleOpenCreateCustomFood = (foodToEdit?: FoodItem) => {
    setCustomFoodToEdit(foodToEdit || null);
    setIsCustomFoodOpen(true);
  };

  const handleAddWaterGlass = async () => {
    if (!currentUser) return;
    await waterService.addWater(currentUser.id, 250);
    refreshUserData();
  };

  const handleAddWaterAmount = async (ml: number) => {
    if (!currentUser) return;
    await waterService.addWater(currentUser.id, ml);
    refreshUserData();
  };

  // Start Active Workout flow
  const handleStartWorkout = (routine?: WorkoutRoutine | null) => {
    if (!currentUser) return;
    workoutService.startActiveWorkout(currentUser.id, routine);
    checkActiveWorkout();
    setActiveTab('active_workout');
  };

  const handleDiscardActiveWorkout = () => {
    if (!currentUser) return;
    workoutService.discardActiveWorkout(currentUser.id);
    checkActiveWorkout();
    if (activeTab === 'active_workout') {
      setActiveTab('workout');
    }
  };

  // Screen Rendering Condition: Auth Check
  if (!currentUser) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        onOpenOnboarding={handleOpenOnboarding}
      />
    );
  }

  // Screen Rendering Condition: Onboarding
  if (isOnboarding) {
    return (
      <OnboardingPage
        user={currentUser}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-[#CCFF00] selection:text-[#0A0A0B]">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          user={currentUser}
          onOpenAddFood={() => handleOpenAddFood('breakfast')}
          onOpenAddWater={() => setIsAddWaterOpen(true)}
          onOpenLogSleep={() => setIsLogSleepOpen(true)}
          onOpenLogWeight={() => setIsLogWeightOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardPage
              user={currentUser}
              foodLogs={foodLogs}
              waterLogs={waterLogs}
              sleepLogs={sleepLogs}
              activityLogs={activityLogs}
              weightLogs={weightLogs}
              nutritionSummary={nutritionSummary}
              progressData={progressData}
              progressDays={progressDays}
              onProgressDaysChange={setProgressDays}
              onTabChange={setActiveTab}
              onOpenAddFood={handleOpenAddFood}
              onOpenAddWater={() => setIsAddWaterOpen(true)}
              onOpenLogSleep={() => setIsLogSleepOpen(true)}
              onOpenLogWeight={() => setIsLogWeightOpen(true)}
              onOpenLogActivity={() => setIsLogActivityOpen(true)}
              onAddWaterGlass={handleAddWaterGlass}
              onAddWaterAmount={handleAddWaterAmount}
              onStartWorkout={(routine) => {
                handleStartWorkout(routine);
              }}
            />
          )}

          {activeTab === 'active_workout' && (
            <ActiveWorkoutPage
              user={currentUser}
              onFinishWorkout={() => {
                refreshUserData();
                checkActiveWorkout();
                setActiveTab('workout');
              }}
              onMinimize={() => {
                checkActiveWorkout();
                setActiveTab('dashboard');
              }}
              onDiscard={() => {
                refreshUserData();
                checkActiveWorkout();
                setActiveTab('workout');
              }}
            />
          )}

          {activeTab === 'workout' && (
            <WorkoutPage
              user={currentUser}
              onCreateRoutine={() => {
                setEditingRoutineId(null);
                setActiveTab('routine_builder');
              }}
              onEditRoutine={(routineId) => {
                setEditingRoutineId(routineId);
                setActiveTab('routine_builder');
              }}
              onNavigateToExercises={() => setActiveTab('exercises')}
              onStartWorkout={(routine) => {
                handleStartWorkout(routine);
              }}
            />
          )}

          {activeTab === 'workout_history' && (
            <WorkoutHistoryPage
              user={currentUser}
              onStartWorkout={() => handleStartWorkout(null)}
              onViewAnalytics={() => setActiveTab('workout')}
            />
          )}

          {activeTab === 'personal_records' && (
            <PersonalRecordsPage
              user={currentUser}
              onStartWorkout={() => handleStartWorkout(null)}
              onViewAnalytics={() => setActiveTab('workout')}
            />
          )}

          {activeTab === 'routine_builder' && (
            <RoutineBuilderPage
              user={currentUser}
              routineToEditId={editingRoutineId}
              onSaveSuccess={() => {
                setEditingRoutineId(null);
                setActiveTab('workout');
              }}
              onCancel={() => {
                setEditingRoutineId(null);
                setActiveTab('workout');
              }}
            />
          )}

          {activeTab === 'exercises' && (
            <ExercisesPage
              user={currentUser}
              onNavigateToWorkout={() => setActiveTab('workout')}
            />
          )}

          {activeTab === 'nutrition' && (
            <NutritionPage
              user={currentUser}
              foodLogs={foodLogs}
              nutritionSummary={nutritionSummary}
              onOpenAddFood={handleOpenAddFood}
              onOpenCreateCustomFood={handleOpenCreateCustomFood}
              onFoodLogsUpdated={refreshUserData}
            />
          )}

          {activeTab === 'diet_plans' && (
            <DietPlansPage
              user={currentUser}
              onOpenCreatePlan={() => setIsCreateDietPlanOpen(true)}
              onPlanApplied={refreshUserData}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityPage
              user={currentUser}
              activityLogs={activityLogs}
              onOpenLogActivity={() => setIsLogActivityOpen(true)}
              onActivityUpdated={refreshUserData}
            />
          )}

          {activeTab === 'sleep' && (
            <SleepPage
              user={currentUser}
              sleepLogs={sleepLogs}
              onOpenLogSleep={() => setIsLogSleepOpen(true)}
              onSleepUpdated={refreshUserData}
            />
          )}

          {activeTab === 'water' && (
            <WaterPage
              user={currentUser}
              waterLogs={waterLogs}
              onOpenAddWater={() => setIsAddWaterOpen(true)}
              onAddGlass={handleAddWaterGlass}
              onAddAmount={handleAddWaterAmount}
              onWaterUpdated={refreshUserData}
            />
          )}

          {activeTab === 'weight' && (
            <WeightPage
              user={currentUser}
              weightLogs={weightLogs}
              onOpenLogWeight={() => setIsLogWeightOpen(true)}
              onWeightUpdated={refreshUserData}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressPage
              user={currentUser}
              progressData={progressData}
              days={progressDays}
              onDaysChange={setProgressDays}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              user={currentUser}
              onProfileUpdated={(updated) => {
                setCurrentUser(updated);
                refreshUserData();
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              user={currentUser}
              onLogout={handleLogout}
              onSwitchUser={handleSwitchUser}
              onDataReset={refreshUserData}
            />
          )}
        </main>
      </div>

      {/* Persistent Floating Banner for background Active Workout */}
      {activeWorkout && activeTab !== 'active_workout' && (
        <ActiveWorkoutBanner
          activeWorkout={activeWorkout}
          onResume={() => setActiveTab('active_workout')}
          onDiscard={handleDiscardActiveWorkout}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Interactive Modals */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        user={currentUser}
        initialMealType={addFoodMealType}
        onFoodLogged={refreshUserData}
        onOpenCreateCustomFood={() => setIsCustomFoodOpen(true)}
      />

      <CustomFoodModal
        isOpen={isCustomFoodOpen}
        onClose={() => setIsCustomFoodOpen(false)}
        user={currentUser}
        editingFood={customFoodToEdit}
        onFoodSaved={() => {
          refreshUserData();
          setIsCustomFoodOpen(false);
        }}
      />

      <AddWaterModal
        isOpen={isAddWaterOpen}
        onClose={() => setIsAddWaterOpen(false)}
        userId={currentUser.id}
        onWaterLogged={refreshUserData}
      />

      <LogSleepModal
        isOpen={isLogSleepOpen}
        onClose={() => setIsLogSleepOpen(false)}
        userId={currentUser.id}
        onSleepLogged={refreshUserData}
      />

      <LogWeightModal
        isOpen={isLogWeightOpen}
        onClose={() => setIsLogWeightOpen(false)}
        userId={currentUser.id}
        currentWeight={currentUser.weight_kg}
        onWeightLogged={refreshUserData}
      />

      <LogActivityModal
        isOpen={isLogActivityOpen}
        onClose={() => setIsLogActivityOpen(false)}
        userId={currentUser.id}
        onActivityLogged={refreshUserData}
      />

      <CreateDietPlanModal
        isOpen={isCreateDietPlanOpen}
        onClose={() => setIsCreateDietPlanOpen(false)}
        user={currentUser}
        onPlanCreated={refreshUserData}
      />
    </div>
  );
}

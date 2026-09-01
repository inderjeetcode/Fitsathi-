import React, { useState, useEffect } from 'react';
import { DailyEnergyBalance } from '../components/Dashboard/DailyEnergyBalance';
import { MetricGrid } from '../components/Dashboard/MetricGrid';
import { TodaysWorkoutCard } from '../components/Dashboard/TodaysWorkoutCard';
import { RecentWorkoutCard } from '../components/Dashboard/RecentWorkoutCard';
import { WorkoutDetailModal } from '../components/Modals/WorkoutDetailModal';
import { DietSummaryDonut } from '../components/Dashboard/DietSummaryDonut';
import { LiquidGlassTracker } from '../components/Dashboard/LiquidGlassTracker';
import { TodayMeals } from '../components/Dashboard/TodayMeals';
import { QuickAddGrid } from '../components/Dashboard/QuickAddGrid';
import { WeightTrackerCard } from '../components/Dashboard/WeightTrackerCard';
import { TodayGoalsCard } from '../components/Dashboard/TodayGoalsCard';
import { ProgressChart } from '../components/Dashboard/ProgressChart';
import { UserProfile, FoodLog, WaterLog, SleepLog, ActivityLog, WeightLog, DailyNutritionSummary, MealType, WorkoutRoutine, WorkoutSessionLog } from '../types';
import { DailyDataPoint } from '../services/progress.service';
import { NavTab } from '../components/Navigation/BottomNav';
import { workoutService } from '../services/workout.service';
import { calculateWorkoutStreak } from '../utils/workoutAnalytics';

interface DashboardPageProps {
  user: UserProfile;
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  activityLogs: ActivityLog[];
  weightLogs: WeightLog[];
  nutritionSummary: DailyNutritionSummary;
  progressData: DailyDataPoint[];
  progressDays: number;
  onProgressDaysChange: (days: number) => void;
  onTabChange: (tab: NavTab) => void;
  onOpenAddFood: (mealType?: MealType) => void;
  onOpenAddWater: () => void;
  onOpenLogSleep: () => void;
  onOpenLogWeight: () => void;
  onOpenLogActivity: () => void;
  onAddWaterGlass: () => void;
  onAddWaterAmount: (ml: number) => void;
  onStartWorkout?: (routine: WorkoutRoutine | null) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  foodLogs,
  waterLogs,
  sleepLogs,
  activityLogs,
  weightLogs,
  nutritionSummary,
  progressData,
  progressDays,
  onProgressDaysChange,
  onTabChange,
  onOpenAddFood,
  onOpenAddWater,
  onOpenLogSleep,
  onOpenLogWeight,
  onOpenLogActivity,
  onAddWaterGlass,
  onAddWaterAmount,
  onStartWorkout
}) => {
  // Workout sessions for recent workout card & streak
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionLog[]>([]);
  const [selectedSessionModal, setSelectedSessionModal] = useState<WorkoutSessionLog | null>(null);

  useEffect(() => {
    workoutService.getWorkoutSessions(user.id).then((sessions) => {
      setWorkoutSessions(sessions);
    });
  }, [user.id]);

  const recentSession = workoutSessions.length > 0 ? workoutSessions[0] : null;
  const workoutStreak = calculateWorkoutStreak(workoutSessions);

  // Activity today
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activityLogs.filter(a => a.log_date === today);
  const stepsToday = todayActivities.reduce((acc, c) => acc + (c.steps || 0), 0) || 8432;

  // Sleep last night
  const todaySleep = sleepLogs.find(s => s.log_date === today) || sleepLogs[0];
  const sleepHoursToday = todaySleep ? todaySleep.duration_minutes / 60 : 7.5;

  // Water today
  const waterMlToday = waterLogs.reduce((acc, c) => acc + (c.amount_ml || 0), 0) || 1500;
  const waterGlassesToday = Math.round((waterMlToday / 250) * 10) / 10;

  // Weight
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : user.weight_kg;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight uppercase">
            Good Morning, {user.full_name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
            Ready to achieve your health & nutrition goals today?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#161618] border border-[#262628] px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-300">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          <button
            onClick={() => onOpenAddFood()}
            className="bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all active:scale-95"
          >
            + Add Log
          </button>
        </div>
      </div>

      {/* 2. Top Energy Balance Card */}
      <DailyEnergyBalance
        caloriesConsumed={nutritionSummary.totalCalories}
        caloriesTarget={nutritionSummary.targetCalories}
        onOpenAddFood={() => onOpenAddFood()}
      />

      {/* 3. 4-Column Metric Grid (Steps, Protein, Sleep, Weight) */}
      <MetricGrid
        steps={stepsToday}
        stepGoal={user.daily_step_goal || 10000}
        protein={nutritionSummary.totalProtein}
        proteinGoal={nutritionSummary.targetProtein}
        sleepHours={sleepHoursToday}
        sleepGoal={user.daily_sleep_hours || 8}
        waterGlasses={waterGlassesToday}
        waterGoal={user.daily_water_glasses || 8}
        currentWeight={currentWeight}
        weightChangeText="↓ 1.5 kg this week"
        onOpenActivity={onOpenLogActivity}
        onOpenNutrition={() => onTabChange('nutrition')}
        onOpenSleep={onOpenLogSleep}
        onOpenWater={onOpenAddWater}
        onOpenWeight={onOpenLogWeight}
      />

      {/* 4. Two-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Scheduled Workout Card */}
          <TodaysWorkoutCard
            user={user}
            onStartWorkout={(routine) => {
              if (onStartWorkout) {
                onStartWorkout(routine);
              } else {
                workoutService.startActiveWorkout(user.id, routine.id, routine.name);
                onTabChange('workout');
              }
            }}
            onCreateRoutine={() => onTabChange('routine_builder')}
            onViewAllRoutines={() => onTabChange('workout')}
          />

          {/* Recent Workout Activity Card */}
          <RecentWorkoutCard
            recentSession={recentSession}
            workoutStreak={workoutStreak}
            onViewDetails={(session) => setSelectedSessionModal(session)}
            onViewHistory={() => onTabChange('workout_history')}
            onStartWorkout={() => {
              if (onStartWorkout) {
                onStartWorkout(null);
              } else {
                onTabChange('workout');
              }
            }}
          />

          {/* Today's Diet Summary */}
          <DietSummaryDonut
            summary={nutritionSummary}
            onViewDetails={() => onTabChange('nutrition')}
          />

          {/* Today's Meals Carousel */}
          <TodayMeals
            foodLogs={foodLogs}
            onAddMealForType={(type) => onOpenAddFood(type)}
            onOpenDietPlan={() => onTabChange('diet_plans')}
          />

          {/* Progress Overview Chart */}
          <ProgressChart
            data={progressData}
            days={progressDays}
            onDaysChange={onProgressDaysChange}
          />
        </div>

        {/* Right / Widget Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Liquid Glass Water Tracker */}
          <LiquidGlassTracker
            currentGlasses={waterGlassesToday}
            goalGlasses={user.daily_water_glasses || 8}
            totalMl={waterMlToday}
            onAddGlass={onAddWaterGlass}
            onAddAmount={onAddWaterAmount}
          />

          {/* Quick Add 2x2 Grid */}
          <QuickAddGrid
            onAddFood={() => onOpenAddFood()}
            onAddWater={onOpenAddWater}
            onLogSleep={onOpenLogSleep}
            onLogWeight={onOpenLogWeight}
          />

          {/* Today's Goals Progress */}
          <TodayGoalsCard
            user={user}
            calories={nutritionSummary.totalCalories}
            steps={stepsToday}
            waterGlasses={waterGlassesToday}
            sleepHours={sleepHoursToday}
            onEditGoals={() => onTabChange('profile')}
          />

          {/* Weight Tracker Card */}
          <WeightTrackerCard
            currentWeight={currentWeight}
            weightLogs={weightLogs}
            trendText="↓ 1.5 kg this week"
            onLogWeight={onOpenLogWeight}
          />
        </div>
      </div>

      {/* Workout Detail Modal if clicked */}
      <WorkoutDetailModal
        isOpen={Boolean(selectedSessionModal)}
        session={selectedSessionModal}
        onClose={() => setSelectedSessionModal(null)}
        onDeleteSession={async (sessionId) => {
          await workoutService.deleteWorkoutSession(sessionId, user.id);
          const updated = await workoutService.getWorkoutSessions(user.id);
          setWorkoutSessions(updated);
        }}
      />
    </div>
  );
};

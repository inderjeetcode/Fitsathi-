import React from 'react';
import { LayoutDashboard, Dumbbell, UtensilsCrossed, TrendingUp, User } from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'workout'
  | 'active_workout'
  | 'routine_builder'
  | 'workout_history'
  | 'personal_records'
  | 'exercises' 
  | 'nutrition' 
  | 'progress' 
  | 'profile' 
  | 'diet_plans' 
  | 'activity' 
  | 'sleep' 
  | 'water' 
  | 'weight' 
  | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'workout' as NavTab, label: 'Workout', icon: Dumbbell },
    { id: 'nutrition' as NavTab, label: 'Nutrition', icon: UtensilsCrossed },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as NavTab, label: 'Profile', icon: User }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141416]/95 backdrop-blur-lg border-t border-[#262628] px-2 pt-2 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = 
            item.id === activeTab ||
            (item.id === 'workout' && (activeTab === 'routine_builder' || activeTab === 'exercises' || activeTab === 'workout_history' || activeTab === 'personal_records')) ||
            (item.id === 'nutrition' && activeTab === 'diet_plans') ||
            (item.id === 'profile' && activeTab === 'settings');

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
                isActive 
                  ? 'text-[#0A0A0B] bg-[#CCFF00] font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)] transform -translate-y-0.5' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


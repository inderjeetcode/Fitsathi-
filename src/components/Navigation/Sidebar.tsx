import React from 'react';
import { 
  LayoutDashboard, 
  Dumbbell,
  BookOpen,
  UtensilsCrossed, 
  Zap, 
  Moon, 
  Droplet, 
  Scale, 
  TrendingUp, 
  User, 
  Settings as SettingsIcon, 
  LogOut,
  PlusCircle,
  Calendar,
  Layers,
  History,
  Trophy
} from 'lucide-react';
import { NavTab } from './BottomNav';
import { UserProfile } from '../../types';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenAddFood: () => void;
  onOpenProfile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
  onOpenAddFood
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workout' as NavTab, label: 'Workouts & Routines', icon: Dumbbell },
    { id: 'workout_history' as NavTab, label: 'Workout History', icon: History },
    { id: 'personal_records' as NavTab, label: 'Personal Records', icon: Trophy },
    { id: 'exercises' as NavTab, label: 'Exercise Library', icon: Layers },
    { id: 'nutrition' as NavTab, label: 'Diet & Nutrition', icon: UtensilsCrossed },
    { id: 'diet_plans' as NavTab, label: 'My Diet Plans', icon: BookOpen },
    { id: 'activity' as NavTab, label: 'Steps & Activity', icon: Zap },
    { id: 'sleep' as NavTab, label: 'Sleep Tracker', icon: Moon },
    { id: 'water' as NavTab, label: 'Water Tracker', icon: Droplet },
    { id: 'weight' as NavTab, label: 'Weight Tracker', icon: Scale },
    { id: 'progress' as NavTab, label: 'Progress & Reports', icon: TrendingUp },
    { id: 'profile' as NavTab, label: 'Profile Settings', icon: User },
    { id: 'settings' as NavTab, label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <aside className="hidden md:flex w-64 bg-[#141416] border-r border-[#262628] flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#CCFF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.25)]">
            <div className="w-5 h-5 bg-[#0A0A0B] rounded-xs transform rotate-45" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#CCFF00] uppercase font-display block leading-none">
              FitSathi
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              Personal Health
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 mb-4">
        <div 
          onClick={() => onTabChange('profile')}
          className="p-3.5 bg-[#161618] border border-[#262628] rounded-2xl cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5C00] to-[#FF00E5] flex items-center justify-center font-black text-white text-sm shadow-md">
              {user?.full_name?.charAt(0) || 'I'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white truncate">{user?.full_name || 'Inderjeet'}</p>
                <span className="bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#CCFF00] h-full w-[75%]" />
                </div>
                <span className="text-[10px] text-zinc-400 font-bold">Lvl {user?.level || 12}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Food Button */}
      <div className="px-4 mb-3">
        <button
          id="btn-sidebar-quick-food"
          onClick={onOpenAddFood}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#CCFF00] to-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:opacity-95 transition-all transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          Log Meal
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#262628] mt-auto">
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

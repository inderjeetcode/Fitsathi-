import React from 'react';
import { Bell, Flame } from 'lucide-react';
import { UserProfile } from '../../types';

interface NavbarProps {
  user: UserProfile | null;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  activeStreak?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenProfile,
  activeStreak = 12
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-[#262628] px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Mobile brand & Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-[#CCFF00] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.3)]">
          <div className="w-4 h-4 bg-[#0A0A0B] rounded-xs transform rotate-45" />
        </div>
        <div>
          <span className="text-lg font-black tracking-tight text-[#CCFF00] uppercase font-display block leading-none">
            FitSathi
          </span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Health & Nutrition
          </span>
        </div>
      </div>

      {/* Right controls: Streak & Profile avatar */}
      <div className="flex items-center gap-2.5">
        {/* Streak badge */}
        <div className="flex items-center gap-1.5 bg-[#161618] border border-[#262628] px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-[#FF5C00] fill-[#FF5C00]" />
          <span className="text-xs font-black text-white">{activeStreak}d</span>
        </div>

        {/* Notifications Icon */}
        <button 
          id="btn-notifications"
          className="relative p-2 rounded-xl bg-[#161618] border border-[#262628] text-zinc-400 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#CCFF00] rounded-full ring-2 ring-[#0A0A0B]" />
        </button>

        {/* User avatar button */}
        <button
          id="btn-nav-profile"
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-[#161618] border border-[#262628] hover:border-zinc-600 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF5C00] to-[#FF00E5] flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <span className="hidden sm:inline text-xs font-bold text-zinc-200">
            {user?.full_name || 'Account'}
          </span>
        </button>
      </div>
    </header>
  );
};

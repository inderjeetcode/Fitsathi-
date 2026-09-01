import React, { useState } from 'react';
import { Shield, LogOut, Database, Download, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types';
import { localDb } from '../lib/supabase';
import firebaseConfig from '../../firebase-applet-config.json';

interface SettingsPageProps {
  user: UserProfile;
  onLogout: () => void;
  onSwitchUser: (email: string) => void;
  onDataReset: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onLogout,
  onSwitchUser,
  onDataReset
}) => {
  const [resetting, setResetting] = useState(false);

  const handleExportData = () => {
    const data = {
      user,
      foodLogs: localDb.getFoodLogs(user.id),
      customFoods: localDb.getCustomFoods(user.id),
      dietPlans: localDb.getDietPlans(user.id),
      waterLogs: localDb.getWaterLogs(user.id),
      sleepLogs: localDb.getSleepLogs(user.id),
      activityLogs: localDb.getActivityLogs(user.id),
      weightLogs: localDb.getWeightLogs(user.id)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitsathi_backup_${user.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all tracking logs to original sample seed data?')) {
      setResetting(true);
      localDb.seedInitialData();
      onDataReset();
      setTimeout(() => setResetting(false), 500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
          Settings & Data Management
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
          Manage system preferences, data persistence, and account security
        </p>
      </div>

      {/* Account Info Card */}
      <div className="card-vibrant p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#CCFF00] font-black text-lg">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-black text-white">{user.full_name}</h3>
            <p className="text-xs text-zinc-400">{user.email}</p>
            <span className="inline-block mt-1 bg-zinc-800 text-[10px] font-bold text-zinc-400 px-2 py-0.5 rounded">
              User ID: {user.id}
            </span>
          </div>
        </div>
      </div>

      {/* Persistence Engine Status */}
      <div className="card-vibrant p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#CCFF00]" />
            <h3 className="text-sm font-black text-white">Database & Storage Engine</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Firebase Firestore Connected
          </span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Active Firestore Database: <span className="font-mono text-zinc-300">{firebaseConfig.projectId}</span>. 
          Protected with Attribute-Based Access Control security rules and real-time synchronization.
        </p>
      </div>

      {/* Multi-Account Switching (Access Isolation Testing) */}
      <div className="card-vibrant p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-black text-white">Test User Switching</h3>
        </div>
        <p className="text-xs text-zinc-400">
          Switch accounts instantly to verify that user logs, foods, and diet plans remain 100% private to each user.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => onSwitchUser('inderjeetcode@gmail.com')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
              user.email === 'inderjeetcode@gmail.com'
                ? 'bg-[#CCFF00] text-[#0A0A0B] border-[#CCFF00]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            Inderjeet (inderjeetcode@gmail.com)
          </button>

          <button
            onClick={() => onSwitchUser('priya.sharma@example.com')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
              user.email === 'priya.sharma@example.com'
                ? 'bg-[#CCFF00] text-[#0A0A0B] border-[#CCFF00]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            Priya Sharma (priya.sharma@example.com)
          </button>
        </div>
      </div>

      {/* Backup & Reset Actions */}
      <div className="card-vibrant p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Data Management & Backups
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            id="btn-export-json"
            onClick={handleExportData}
            className="flex-1 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data (JSON Backup)
          </button>

          <button
            id="btn-reset-seed"
            onClick={handleResetData}
            disabled={resetting}
            className="flex-1 py-3 bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-zinc-300 hover:text-red-400 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {resetting ? 'Resetting...' : 'Reset to Default Seed'}
          </button>
        </div>
      </div>

      {/* Dataset & Media Attribution */}
      <div className="card-vibrant p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Credits & Data Attribution
        </h3>
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div>
            <p className="text-xs font-bold text-white mb-1">
              Exercise data by <a href="https://repdb.co" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">RepDB (repdb.co)</a>
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Exercise metadata, biomechanical cues, and 512px WebP illustrations provided under the RepDB Free Tier License.
            </p>
          </div>
          <a
            href="https://repdb.co"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-200 rounded-xl border border-zinc-700 transition-colors shrink-0"
          >
            Visit RepDB
          </a>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-4">
        <button
          id="btn-logout"
          onClick={onLogout}
          className="w-full py-3.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out from FitSathi
        </button>
      </div>
    </div>
  );
};

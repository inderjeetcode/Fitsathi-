import React from 'react';
import { Moon, Star, Plus, Trash2 } from 'lucide-react';
import { UserProfile, SleepLog } from '../types';
import { sleepService } from '../services/sleep.service';

interface SleepPageProps {
  user: UserProfile;
  sleepLogs: SleepLog[];
  onOpenLogSleep: () => void;
  onSleepUpdated: () => void;
}

export const SleepPage: React.FC<SleepPageProps> = ({
  user,
  sleepLogs,
  onOpenLogSleep,
  onSleepUpdated
}) => {
  const today = new Date().toISOString().split('T')[0];
  const latestSleep = sleepLogs[0];
  const durationHours = latestSleep ? (latestSleep.duration_minutes / 60).toFixed(1) : '7.5';
  const targetSleep = user.daily_sleep_hours || 8;

  const handleDeleteSleep = async (id: string) => {
    try {
      await sleepService.deleteSleep(id, user.id);
      onSleepUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
            Sleep & Recovery
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Optimize circadian rhythm, rest intervals, and sleep efficiency
          </p>
        </div>

        <button
          id="btn-open-log-sleep-page"
          onClick={onOpenLogSleep}
          className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Log Sleep Session
        </button>
      </div>

      {/* Hero Sleep Card */}
      <div className="card-vibrant p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Last Night's Sleep
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-white font-display leading-none">
                {durationHours}
              </span>
              <span className="text-zinc-500 font-bold text-sm">/ {targetSleep} Hours</span>
            </div>
            {latestSleep && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-zinc-400">Quality:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= latestSleep.quality_score
                          ? 'text-purple-400 fill-purple-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs space-y-1.5 w-full sm:w-64">
            <div className="flex justify-between">
              <span className="text-zinc-400">Bed Time:</span>
              <strong className="text-white">{latestSleep?.bed_time || '11:00 PM'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Wake Time:</span>
              <strong className="text-white">{latestSleep?.wake_time || '07:00 AM'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Goal Target:</span>
              <strong className="text-purple-400">{targetSleep} hrs / night</strong>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card-vibrant p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Sleep Log History
        </h3>

        {sleepLogs.length === 0 ? (
          <p className="text-xs text-zinc-600 italic text-center py-6">
            No sleep logs recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {sleepLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-[#141416] border border-[#262628] rounded-2xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      {(log.duration_minutes / 60).toFixed(1)} Hours
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">{log.log_date}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {log.bed_time} → {log.wake_time} {log.notes && `• "${log.notes}"`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= log.quality_score
                            ? 'text-purple-400 fill-purple-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteSleep(log.id)}
                    className="p-1.5 text-zinc-600 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

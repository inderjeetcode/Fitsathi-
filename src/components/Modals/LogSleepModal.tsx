import React, { useState } from 'react';
import { X, Moon, Star, Check } from 'lucide-react';
import { sleepService } from '../../services/sleep.service';

interface LogSleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSleepLogged: () => void;
}

export const LogSleepModal: React.FC<LogSleepModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSleepLogged
}) => {
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const durationMin = sleepService.calculateDurationMinutes(bedTime, wakeTime);
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sleepService.logSleep(userId, bedTime, wakeTime, quality, notes);
      onSleepLogged();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-[#262628] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Log Sleep
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Bed Time
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="w-full bg-[#161618] border border-[#262628] focus:border-purple-400 text-sm font-bold text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Wake Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-[#161618] border border-[#262628] focus:border-purple-400 text-sm font-bold text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* Calculated duration banner */}
          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300">Total Calculated Duration:</span>
            <span className="text-sm font-black text-purple-200 font-display">
              {hours}h {mins}m
            </span>
          </div>

          {/* Sleep Quality Rating 1-5 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Sleep Quality (1 - 5 Stars)
            </label>
            <div className="flex items-center gap-2 justify-center py-2 bg-[#161618] border border-[#262628] rounded-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setQuality(star)}
                  className="p-1.5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= quality
                        ? 'text-purple-400 fill-purple-400'
                        : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Deep REM sleep, woke up refreshed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase rounded-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-sleep"
              disabled={saving}
              className="flex-[2] py-3 bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {saving ? 'Saving...' : 'Save Sleep Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Zap, Check } from 'lucide-react';
import { activityService } from '../../services/activity.service';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onActivityLogged: () => void;
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  userId,
  onActivityLogged
}) => {
  const [steps, setSteps] = useState<number>(3500);
  const [activeMinutes, setActiveMinutes] = useState<number>(30);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(200);
  const [activityType, setActivityType] = useState('Brisk Walking');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await activityService.logActivity(
        userId,
        Number(steps) || 0,
        Number(activeMinutes) || 0,
        Number(caloriesBurned) || 0,
        activityType
      );
      onActivityLogged();
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
            <div className="w-8 h-8 rounded-xl bg-[#FF5C00]/20 text-[#FF5C00] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Log Activity & Steps
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FF5C00] mb-1.5">
              Steps
            </label>
            <input
              type="number"
              min="0"
              required
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full bg-[#161618] border border-[#262628] focus:border-[#FF5C00] text-2xl font-black text-white rounded-2xl px-4 py-2.5 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Active Minutes
              </label>
              <input
                type="number"
                min="0"
                required
                value={activeMinutes}
                onChange={(e) => setActiveMinutes(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Calories Burned (kcal)
              </label>
              <input
                type="number"
                min="0"
                required
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
            >
              <option value="Brisk Walking">Brisk Walking</option>
              <option value="Running / Jogging">Running / Jogging</option>
              <option value="Gym & Weight Training">Gym & Weight Training</option>
              <option value="Yoga & Stretching">Yoga & Stretching</option>
              <option value="Cycling">Cycling</option>
              <option value="Sports / Badminton / Cricket">Sports (Badminton, Cricket, etc.)</option>
              <option value="Other Workout">Other Workout</option>
            </select>
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
              id="btn-save-activity"
              disabled={saving}
              className="flex-[2] py-3 bg-[#FF5C00] hover:bg-[#e05200] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,92,0,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {saving ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

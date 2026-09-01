import React, { useState } from 'react';
import { X, Scale, Check } from 'lucide-react';
import { weightService } from '../../services/weight.service';

interface LogWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialWeight?: number;
  onWeightLogged: () => void;
}

export const LogWeightModal: React.FC<LogWeightModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialWeight = 68.5,
  onWeightLogged
}) => {
  const [weight, setWeight] = useState<number>(initialWeight);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || weight <= 0) return;

    setSaving(true);
    try {
      await weightService.logWeight(userId, Number(weight), notes, date);
      onWeightLogged();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-[#262628] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Log Body Weight
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
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Weight (kg) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-emerald-400 text-2xl font-black text-white rounded-2xl px-4 py-3 outline-none"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                KG
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Morning weighing, empty stomach"
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
              id="btn-save-weight"
              disabled={saving}
              className="flex-[2] py-3 bg-emerald-400 hover:bg-emerald-300 text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {saving ? 'Saving...' : 'Save Weight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

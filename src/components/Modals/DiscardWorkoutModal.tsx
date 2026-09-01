import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DiscardWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDiscard: () => void;
}

export const DiscardWorkoutModal: React.FC<DiscardWorkoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmDiscard
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="modal-discard-workout"
        className="w-full max-w-md bg-[#141416] border border-[#262628] rounded-3xl p-6 shadow-2xl space-y-6"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-white font-display">
            Discard Active Workout?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
            Are you sure you want to cancel this workout? Any completed sets and logged numbers for this session will be discarded and not saved to your history.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            id="btn-cancel-discard"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
          >
            Keep Working Out
          </button>
          <button
            id="btn-confirm-discard-workout"
            onClick={onConfirmDiscard}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

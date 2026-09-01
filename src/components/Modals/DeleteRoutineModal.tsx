import React from 'react';
import { AlertTriangle, Trash2, X, ShieldCheck } from 'lucide-react';
import { WorkoutRoutine } from '../../types';

interface DeleteRoutineModalProps {
  routine: WorkoutRoutine | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (routine: WorkoutRoutine) => void;
}

export const DeleteRoutineModal: React.FC<DeleteRoutineModalProps> = ({
  routine,
  isOpen,
  onClose,
  onConfirmDelete
}) => {
  if (!isOpen || !routine) return null;

  return (
    <div
      id="delete-routine-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="delete-routine-modal"
        className="bg-[#141416] border border-[#262628] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-white font-display tracking-tight">
              Delete Routine?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-medium leading-relaxed">
              Are you sure you want to delete <span className="text-white font-bold">"{routine.name}"</span>?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Assurance Callout */}
        <div className="p-3.5 bg-[#18181B] border border-zinc-800 rounded-2xl flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-normal">
            <strong className="text-zinc-200">Your logged workout history is safe:</strong> Deleting this routine template will not delete any completed workout sessions, PR records, or volume stats in your logs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="btn-cancel-delete-routine"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-delete-routine"
            onClick={() => onConfirmDelete(routine)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Delete Routine
          </button>
        </div>
      </div>
    </div>
  );
};

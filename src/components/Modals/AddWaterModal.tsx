import React, { useState } from 'react';
import { X, Droplet, Plus, Check } from 'lucide-react';
import { waterService } from '../../services/water.service';

interface AddWaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onWaterLogged: () => void;
}

export const AddWaterModal: React.FC<AddWaterModalProps> = ({
  isOpen,
  onClose,
  userId,
  onWaterLogged
}) => {
  const [customMl, setCustomMl] = useState<number>(250);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (amount: number) => {
    setSaving(true);
    try {
      await waterService.addWater(userId, amount);
      onWaterLogged();
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
            <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Log Water
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { label: '1 Glass (250 ml)', ml: 250 },
            { label: 'Bottle (500 ml)', ml: 500 },
            { label: 'Sipper (750 ml)', ml: 750 },
            { label: 'Flask (1000 ml)', ml: 1000 }
          ].map((item) => (
            <button
              key={item.ml}
              onClick={() => handleAdd(item.ml)}
              disabled={saving}
              className="p-3 bg-[#161618] border border-[#262628] hover:border-cyan-400/60 rounded-2xl flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
            >
              <span className="text-xs font-bold text-white group-hover:text-cyan-400">
                +{item.ml} ml
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="p-3 bg-[#161618] border border-[#262628] rounded-2xl mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Custom Amount (ml)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="50"
              step="50"
              value={customMl}
              onChange={(e) => setCustomMl(Number(e.target.value))}
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-cyan-400 text-sm font-bold text-white rounded-xl px-3 py-2 outline-none"
            />
            <button
              id="btn-add-custom-water"
              onClick={() => handleAdd(customMl)}
              disabled={saving || customMl <= 0}
              className="px-4 py-2 bg-cyan-400 text-[#0A0A0B] font-black text-xs uppercase rounded-xl flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

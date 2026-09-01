import React, { useState, useEffect } from 'react';
import { Timer, Plus, Minus, X, Volume2, VolumeX, Pause, Play, Check } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  exerciseName?: string;
  nextSetNumber?: number;
  onClose: () => void;
  onComplete?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  exerciseName,
  nextSetNumber,
  onClose,
  onComplete
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync with initialSeconds when opened
  useEffect(() => {
    if (isOpen) {
      const validSecs = Math.max(5, initialSeconds || 60);
      setTotalSeconds(validSecs);
      setRemainingSeconds(validSecs);
      setIsPaused(false);
      setIsCompleted(false);
    }
  }, [isOpen, initialSeconds]);

  // Main countdown timer interval
  useEffect(() => {
    if (!isOpen || isPaused || isCompleted) return;

    if (remainingSeconds <= 0) {
      setIsCompleted(true);
      if (soundEnabled) {
        soundEffects.playRestTimerComplete();
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {
          // Ignore
        }
      }
      if (onComplete) onComplete();
      
      const timeout = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, remainingSeconds, isCompleted, soundEnabled, onComplete, onClose]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));

  const addTime = (secsToAdd: number) => {
    setRemainingSeconds((prev) => Math.max(5, prev + secsToAdd));
    setTotalSeconds((prev) => Math.max(prev, remainingSeconds + secsToAdd));
  };

  return (
    <div 
      id="workout-rest-timer-bar"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg bg-[#18181B]/95 backdrop-blur-xl border-2 border-[#CCFF00]/60 rounded-3xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_30px_rgba(204,255,0,0.2)] animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Progress Bar Top */}
      <div className="absolute top-0 left-4 right-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-400' : 'bg-[#CCFF00]'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-1">
        {/* Left: Info & Timer Display */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${
            isCompleted 
              ? 'bg-emerald-400 text-[#0A0A0B]' 
              : 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.3)]'
          }`}>
            {isCompleted ? (
              <Check className="w-6 h-6 stroke-[3]" />
            ) : (
              <Timer className="w-6 h-6 stroke-[2.5] animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                {isCompleted ? 'Rest Over!' : formatTime(remainingSeconds)}
              </span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Rest
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-[180px] sm:max-w-[240px] font-medium">
              {exerciseName ? (
                <span>Next: <strong className="text-zinc-200">{exerciseName}</strong> {nextSetNumber ? `(Set ${nextSetNumber})` : ''}</span>
              ) : (
                'Catch your breath & prepare'
              )}
            </p>
          </div>
        </div>

        {/* Right: Timer Quick Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="btn-timer-minus-15"
            onClick={() => addTime(-15)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 text-xs font-bold transition-colors"
            title="Subtract 15 seconds"
          >
            -15s
          </button>

          <button
            id="btn-timer-plus-30"
            onClick={() => addTime(30)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 text-xs font-bold transition-colors"
            title="Add 30 seconds"
          >
            +30s
          </button>

          <button
            id="btn-timer-pause-resume"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Timer' : 'Pause Timer'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            id="btn-timer-toggle-sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#CCFF00]" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          <button
            id="btn-timer-dismiss"
            onClick={onClose}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors ml-1"
            title="Skip Rest"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

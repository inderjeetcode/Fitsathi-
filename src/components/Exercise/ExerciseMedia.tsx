import React, { useState } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Target, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Layers, 
  HeartPulse, 
  Sparkles,
  Play
} from 'lucide-react';
import { Exercise, ExerciseCategory } from '../../types';

interface ExerciseMediaProps {
  exercise: Exercise;
  size?: 'thumb' | 'card' | 'hero' | 'sm';
  className?: string;
  showCategoryBadge?: boolean;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  autoplayGif?: boolean;
}

// Category visual palettes & icons
const CATEGORY_VISUALS: Record<ExerciseCategory, {
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  pattern: string;
}> = {
  chest: {
    icon: Flame,
    accentColor: '#FF5C00',
    bgGradient: 'from-[#FF5C00]/20 via-[#1C120C] to-[#121214]',
    borderColor: 'border-[#FF5C00]/30',
    badgeBg: 'bg-[#FF5C00]/15',
    badgeText: 'text-[#FF5C00]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(255, 92, 0, 0.18) 0%, transparent 70%)'
  },
  back: {
    icon: Target,
    accentColor: '#00E5FF',
    bgGradient: 'from-[#00E5FF]/20 via-[#0C1A1C] to-[#121214]',
    borderColor: 'border-[#00E5FF]/30',
    badgeBg: 'bg-[#00E5FF]/15',
    badgeText: 'text-[#00E5FF]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(0, 229, 255, 0.18) 0%, transparent 70%)'
  },
  legs: {
    icon: Zap,
    accentColor: '#CCFF00',
    bgGradient: 'from-[#CCFF00]/20 via-[#161C0C] to-[#121214]',
    borderColor: 'border-[#CCFF00]/30',
    badgeBg: 'bg-[#CCFF00]/15',
    badgeText: 'text-[#CCFF00]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(204, 255, 0, 0.18) 0%, transparent 70%)'
  },
  shoulders: {
    icon: Layers,
    accentColor: '#FF00E5',
    bgGradient: 'from-[#FF00E5]/20 via-[#1C0C1A] to-[#121214]',
    borderColor: 'border-[#FF00E5]/30',
    badgeBg: 'bg-[#FF00E5]/15',
    badgeText: 'text-[#FF00E5]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(255, 0, 229, 0.18) 0%, transparent 70%)'
  },
  biceps: {
    icon: Dumbbell,
    accentColor: '#FF9900',
    bgGradient: 'from-[#FF9900]/20 via-[#1C150C] to-[#121214]',
    borderColor: 'border-[#FF9900]/30',
    badgeBg: 'bg-[#FF9900]/15',
    badgeText: 'text-[#FF9900]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(255, 153, 0, 0.18) 0%, transparent 70%)'
  },
  triceps: {
    icon: Zap,
    accentColor: '#A855F7',
    bgGradient: 'from-[#A855F7]/20 via-[#160C1C] to-[#121214]',
    borderColor: 'border-[#A855F7]/30',
    badgeBg: 'bg-[#A855F7]/15',
    badgeText: 'text-[#A855F7]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(168, 85, 247, 0.18) 0%, transparent 70%)'
  },
  core: {
    icon: ShieldCheck,
    accentColor: '#10B981',
    bgGradient: 'from-[#10B981]/20 via-[#0C1C14] to-[#121214]',
    borderColor: 'border-[#10B981]/30',
    badgeBg: 'bg-[#10B981]/15',
    badgeText: 'text-[#10B981]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.18) 0%, transparent 70%)'
  },
  cardio: {
    icon: HeartPulse,
    accentColor: '#EF4444',
    bgGradient: 'from-[#EF4444]/20 via-[#1C0C0C] to-[#121214]',
    borderColor: 'border-[#EF4444]/30',
    badgeBg: 'bg-[#EF4444]/15',
    badgeText: 'text-[#EF4444]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(239, 68, 68, 0.18) 0%, transparent 70%)'
  },
  full_body: {
    icon: Sparkles,
    accentColor: '#CCFF00',
    bgGradient: 'from-[#CCFF00]/20 via-[#161C0C] to-[#121214]',
    borderColor: 'border-[#CCFF00]/30',
    badgeBg: 'bg-[#CCFF00]/15',
    badgeText: 'text-[#CCFF00]',
    pattern: 'radial-gradient(circle at 50% 40%, rgba(204, 255, 0, 0.18) 0%, transparent 70%)'
  }
};

export const ExerciseMedia: React.FC<ExerciseMediaProps> = ({
  exercise,
  size = 'card',
  className = '',
  showCategoryBadge = false,
  aspectRatio = 'auto'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Preferred source order: gif_url > image_url > media_url
  const mediaSrc = exercise.gif_url || exercise.image_url || exercise.media_url;
  const hasMedia = Boolean(mediaSrc) && !imageError;

  const visual = CATEGORY_VISUALS[exercise.category] || CATEGORY_VISUALS.full_body;
  const CategoryIcon = visual.icon;

  // Determine aspect ratio class
  const getAspectClass = () => {
    if (aspectRatio === 'video') return 'aspect-video';
    if (aspectRatio === 'square') return 'aspect-square';
    if (aspectRatio === 'wide') return 'aspect-[21/9]';
    if (size === 'thumb') return 'w-12 h-12 shrink-0';
    if (size === 'sm') return 'w-16 h-16 shrink-0';
    if (size === 'card') return 'h-36 sm:h-40 w-full';
    if (size === 'hero') return 'h-48 sm:h-64 w-full';
    return 'w-full h-full';
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border ${visual.borderColor} bg-[#121214] flex items-center justify-center select-none ${getAspectClass()} ${className}`}
    >
      {/* 1. Actual Render of Media (Image or GIF) if provided and working */}
      {hasMedia && (
        <>
          <img
            src={mediaSrc}
            alt={exercise.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain bg-[#0E0E10] p-1.5 transition-all duration-300 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
          {/* Subtle loading shimmer if not loaded yet */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#18181B] animate-pulse flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-zinc-600 animate-spin" />
            </div>
          )}
        </>
      )}

      {/* 2. FitSathi Illustrated Aesthetic Fallback when media is absent or errors */}
      {(!hasMedia || !imageLoaded) && !hasMedia && (
        <div 
          className={`w-full h-full bg-gradient-to-b ${visual.bgGradient} flex flex-col items-center justify-center p-3 relative`}
          style={{ backgroundImage: visual.pattern }}
        >
          {/* Subtle grid background accent */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* Center Graphic */}
          <div className="relative flex flex-col items-center justify-center z-10 text-center">
            <div 
              className="p-3 rounded-2xl backdrop-blur-md shadow-lg border flex items-center justify-center transition-transform hover:scale-105"
              style={{
                backgroundColor: `${visual.accentColor}15`,
                borderColor: `${visual.accentColor}40`,
                boxShadow: `0 0 20px ${visual.accentColor}20`
              }}
            >
              <CategoryIcon 
                className={size === 'thumb' || size === 'sm' ? 'w-5 h-5' : size === 'hero' ? 'w-10 h-10' : 'w-7 h-7'}
                style={{ color: visual.accentColor }}
              />
            </div>

            {size !== 'thumb' && size !== 'sm' && (
              <div className="mt-2 text-center">
                <span 
                  className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${visual.accentColor}18`,
                    color: visual.accentColor,
                    borderColor: `${visual.accentColor}40`
                  }}
                >
                  {exercise.targetMuscle}
                </span>
              </div>
            )}
          </div>

          {/* Equipment Pill in bottom-right for card/hero sizes */}
          {(size === 'card' || size === 'hero') && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0A0A0B]/80 text-zinc-300 border border-zinc-800 backdrop-blur-sm">
                {exercise.equipment}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Category Badge overlay if requested */}
      {showCategoryBadge && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md ${visual.badgeBg} ${visual.borderColor} ${visual.badgeText}`}>
            {exercise.category}
          </span>
        </div>
      )}
    </div>
  );
};

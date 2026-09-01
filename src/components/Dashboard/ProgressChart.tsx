import React, { useState } from 'react';
import { DailyDataPoint } from '../../services/progress.service';

interface ProgressChartProps {
  data: DailyDataPoint[];
  days: number;
  onDaysChange: (days: number) => void;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  days,
  onDaysChange
}) => {
  const [activeMetric, setActiveMetric] = useState<'both' | 'steps' | 'weight'>('both');

  // Filter valid points
  const points = data.slice(-days);
  const stepsList = points.map(p => p.steps || 0);
  const maxSteps = Math.max(...stepsList, 12000);

  const weightList = points.map(p => p.weight || 68.5);
  const minWeight = Math.min(...weightList, 65) - 1;
  const maxWeight = Math.max(...weightList, 72) + 1;
  const weightRange = maxWeight - minWeight || 1;

  return (
    <div className="card-vibrant p-6">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider font-display">
            Progress Overview
          </h3>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-bold text-zinc-400">Steps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
              <span className="text-xs font-bold text-zinc-400">Weight (kg)</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl self-start sm:self-auto">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              id={`filter-progress-${d}d`}
              onClick={() => onDaysChange(d)}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                days === d
                  ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* SVG Responsive Multi-Metric Chart */}
      <div className="h-56 w-full relative">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 45, 90, 135, 180].map((y, idx) => (
            <line
              key={idx}
              x1="0"
              y1={y}
              x2="500"
              y2={y}
              stroke="#262628"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Steps Area & Line (Cyan) */}
          {(activeMetric === 'both' || activeMetric === 'steps') && points.length >= 2 && (
            <>
              {/* Cyan gradient area */}
              <defs>
                <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Steps Polygon Area */}
              <polygon
                fill="url(#cyanGlow)"
                points={`0,180 ${points
                  .map((p, idx) => {
                    const x = (idx / (points.length - 1)) * 500;
                    const val = p.steps || 0;
                    const y = 180 - (val / maxSteps) * 150;
                    return `${x},${y}`;
                  })
                  .join(' ')} 500,180`}
              />

              {/* Steps Curve Line */}
              <polyline
                fill="none"
                stroke="#22D3EE"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points
                  .map((p, idx) => {
                    const x = (idx / (points.length - 1)) * 500;
                    const val = p.steps || 0;
                    const y = 180 - (val / maxSteps) * 150;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Steps Dots */}
              {points.map((p, idx) => {
                const x = (idx / (points.length - 1)) * 500;
                const val = p.steps || 0;
                const y = 180 - (val / maxSteps) * 150;
                return (
                  <circle
                    key={`step-dot-${idx}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#22D3EE"
                    className="stroke-[#0A0A0B] stroke-2"
                  />
                );
              })}
            </>
          )}

          {/* Weight Line (Purple) */}
          {(activeMetric === 'both' || activeMetric === 'weight') && points.length >= 2 && (
            <>
              <polyline
                fill="none"
                stroke="#A855F7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points
                  .map((p, idx) => {
                    const x = (idx / (points.length - 1)) * 500;
                    const val = p.weight || 68.5;
                    const y = 180 - ((val - minWeight) / weightRange) * 140;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              {points.map((p, idx) => {
                const x = (idx / (points.length - 1)) * 500;
                const val = p.weight || 68.5;
                const y = 180 - ((val - minWeight) / weightRange) * 140;
                return (
                  <circle
                    key={`weight-dot-${idx}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#A855F7"
                    className="stroke-[#0A0A0B] stroke-2"
                  />
                );
              })}
            </>
          )}
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[10px] font-bold text-zinc-500 mt-2 px-1">
          {points.map((p, idx) => (
            <span key={idx} className={idx % Math.ceil(points.length / 7) === 0 ? 'block' : 'hidden sm:block'}>
              {p.displayDate}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

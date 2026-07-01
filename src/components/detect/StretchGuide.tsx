"use client";

import { useState } from "react";

interface StretchGuideProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface Exercise {
  name: string;
  description: string;
  duration: string;
  animation: "neck-tilt" | "shoulder-roll" | "forward-bend" | "side-bend";
}

const EXERCISES: Exercise[] = [
  {
    name: "颈部侧拉伸",
    description: "缓慢将头倾向左侧，保持5秒，再换右侧。重复3次。",
    duration: "30 秒",
    animation: "neck-tilt",
  },
  {
    name: "肩部环绕",
    description: "双肩同时向后画圈，幅度尽量大。10次后反方向。",
    duration: "30 秒",
    animation: "shoulder-roll",
  },
  {
    name: "坐姿前屈",
    description: "坐直后缓慢前倾，双手触地（尽量），保持10秒后回正。",
    duration: "30 秒",
    animation: "forward-bend",
  },
  {
    name: "站立体侧屈",
    description: "站立，一手叉腰，另一手举过头顶向侧弯。左右各10秒。",
    duration: "30 秒",
    animation: "side-bend",
  },
];

/** SVG figure that animates based on the exercise type. */
function StretchFigure({ type }: { type: Exercise["animation"] }) {
  // Each animation uses CSS keyframes defined inline via <style>
  const animName = `stretch-${type}`;

  return (
    <div className="flex items-center justify-center h-32 mb-3">
      <style>{`
        @keyframes ${animName} {
          0%, 100% { transform: var(--start); }
          50% { transform: var(--mid); }
        }
      `}</style>
      <svg viewBox="0 0 100 120" className="h-full w-auto">
        {/* Simple stick figure */}
        {/* Head */}
        <circle
          cx="50"
          cy="20"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-primary"
          style={{
            // @ts-expect-error CSS custom properties
            "--start": "translate(0, 0)",
            "--mid": type === "neck-tilt" ? "translate(-4px, 0)" : "translate(0, 0)",
            animation: `${animName} 3s ease-in-out infinite`,
          }}
        />
        {/* Body / spine */}
        <line
          x1="50"
          y1="28"
          x2="50"
          y2="70"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-primary"
        />
        {/* Arms */}
        {type === "shoulder-roll" ? (
          <>
            <circle
              cx="35"
              cy="40"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary-light"
              style={{
                // @ts-expect-error CSS custom properties
                "--start": "translate(0, 0)",
                "--mid": "translate(0, -8px)",
                animation: `${animName} 3s ease-in-out infinite`,
              }}
            />
            <circle
              cx="65"
              cy="40"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary-light"
              style={{
                // @ts-expect-error CSS custom properties
                "--start": "translate(0, 0)",
                "--mid": "translate(0, -8px)",
                animation: `${animName} 3s ease-in-out infinite`,
              }}
            />
          </>
        ) : type === "side-bend" ? (
          <line
            x1="50"
            y1="35"
            x2="70"
            y2="45"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-primary-light"
            style={{
              // @ts-expect-error CSS custom properties
              "--start": "translate(0, 0)",
              "--mid": "translate(2px, -5px)",
              animation: `${animName} 3s ease-in-out infinite`,
            }}
          />
        ) : (
          <>
            <line x1="50" y1="35" x2="35" y2="55" stroke="currentColor" strokeWidth="2.5" className="text-primary-light" />
            <line x1="50" y1="35" x2="65" y2="55" stroke="currentColor" strokeWidth="2.5" className="text-primary-light" />
          </>
        )}
        {/* Legs */}
        <line x1="50" y1="70" x2="40" y2="105" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
        <line x1="50" y1="70" x2="60" y2="105" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
        {/* Forward bend - bend the spine */}
        {type === "forward-bend" && (
          <line
            x1="50"
            y1="28"
            x2="50"
            y2="70"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-primary"
            style={{
              // @ts-expect-error CSS custom properties
              "--start": "rotate(0deg)",
              "--mid": "rotate(20deg)",
              transformOrigin: "50px 70px",
              animation: `${animName} 3s ease-in-out infinite`,
            }}
          />
        )}
        {/* Side bend - tilt whole upper body */}
        {type === "side-bend" && (
          <g
            style={{
              // @ts-expect-error CSS custom properties
              "--start": "rotate(0deg)",
              "--mid": "rotate(8deg)",
              transformOrigin: "50px 70px",
              animation: `${animName} 3s ease-in-out infinite`,
            }}
          >
            <circle cx="50" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
            <line x1="50" y1="28" x2="50" y2="70" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
            <line x1="50" y1="35" x2="35" y2="55" stroke="currentColor" strokeWidth="2.5" className="text-primary-light" />
            <line x1="50" y1="35" x2="65" y2="55" stroke="currentColor" strokeWidth="2.5" className="text-primary-light" />
          </g>
        )}
      </svg>
    </div>
  );
}

export default function StretchGuide({ onComplete, onSkip }: StretchGuideProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false]);

  const exercise = EXERCISES[currentIndex];
  const isLast = currentIndex === EXERCISES.length - 1;
  const allDone = completed.every(Boolean);

  const handleCheck = () => {
    const next = [...completed];
    next[currentIndex] = true;
    setCompleted(next);

    if (isLast) {
      // All done
      setTimeout(() => onComplete(), 300);
    } else {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  return (
    <div className="bg-surface rounded-2xl p-5 w-full max-w-sm mx-auto">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {EXERCISES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex
                ? "w-6 bg-primary"
                : completed[i]
                ? "w-1.5 bg-primary/60"
                : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Exercise index */}
      <p className="text-xs text-text-muted text-center mb-2">
        动作 {currentIndex + 1} / {EXERCISES.length} · {exercise.duration}
      </p>

      {/* Exercise name */}
      <h4 className="text-base font-bold text-text-primary text-center mb-3">
        {exercise.name}
      </h4>

      {/* Animated SVG figure */}
      <div className="text-primary">
        <StretchFigure type={exercise.animation} />
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary text-center leading-relaxed mb-5">
        {exercise.description}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCheck}
          className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {isLast ? "完成" : "下一个"}
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2.5 bg-surface-alt hover:bg-border text-text-secondary rounded-xl transition-colors text-sm font-medium"
        >
          跳过
        </button>
      </div>
    </div>
  );
}

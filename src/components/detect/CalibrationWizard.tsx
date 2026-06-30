"use client";

import { useState } from "react";

interface CalibrationWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    title: "调整摄像头位置",
    description: "将摄像头放在显示器上方，确保能拍到你的上半身（头部到腰部）。",
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    title: "保持标准坐姿",
    description: "双脚平放地面，背部挺直，肩膀放松自然下垂，眼睛平视屏幕。",
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        <path d="M12 8v4" />
        <path d="M8 12h8" />
        <path d="M9 16l3 4 3-4" />
        <path d="M8 20h8" />
      </svg>
    ),
  },
  {
    title: "准备就绪",
    description: '校准完成！点击"开始检测"按钮，AI 将实时守护你的坐姿。',
    icon: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function CalibrationWizard({ onComplete, onSkip }: CalibrationWizardProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/60">
      <div className="bg-surface rounded-3xl p-6 md:p-8 max-w-md mx-4 shadow-xl animate-fade-in">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= step ? "bg-primary w-8" : "bg-border w-4"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center text-primary mb-4">
          {current.icon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-text-primary text-center mb-2">
          {current.title}
        </h3>
        <p className="text-sm text-text-secondary text-center leading-relaxed">
          {current.description}
        </p>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 bg-surface-alt hover:bg-border text-text-secondary font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              上一步
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-primary/25"
          >
            {step === STEPS.length - 1 ? "开始检测" : "下一步"}
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          className="w-full text-center text-xs text-text-muted hover:text-text-secondary mt-4 transition-colors"
        >
          跳过引导（首次使用建议完成校准）
        </button>
      </div>
    </div>
  );
}

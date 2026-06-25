"use client";

interface LoadingSpinnerProps {
  text?: string;
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ text, size = 32, className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className="border-2 border-primary border-t-transparent rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  );
}

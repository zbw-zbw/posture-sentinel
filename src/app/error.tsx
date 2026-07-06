"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-danger" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">页面出错了</h2>
        <p className="text-sm text-text-secondary mb-6">
          抱歉，页面加载时遇到了问题。可以尝试重新加载。
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary-dark hover:bg-primary text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          重新加载
        </button>
      </div>
    </div>
  );
}

"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto text-warning" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">检测功能出错了</h2>
            <p className="text-text-secondary mb-4">AI 模型加载或摄像头出现异常</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

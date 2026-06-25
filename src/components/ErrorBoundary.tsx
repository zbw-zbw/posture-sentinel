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
            <div className="text-4xl mb-4">⚠️</div>
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

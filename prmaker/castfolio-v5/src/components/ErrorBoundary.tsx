import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary: 하위 컴포넌트 렌더링 에러를 잡아서
 * 빈 화면 대신 에러 메시지를 보여줌
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-800 mb-2">
              {this.props.fallbackTitle || '화면을 불러오는 중 오류가 발생했습니다'}
            </h3>
            <p className="text-red-600 text-sm mb-4">
              {this.state.error?.message || '알 수 없는 오류'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors"
              >
                <RefreshCcw size={14} />
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

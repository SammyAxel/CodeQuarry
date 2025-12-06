/**
 * Error Boundary Component
 * Catches errors in child components and displays a fallback UI
 * Prevents entire app from crashing due to a single component error
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#161b22] border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="mb-4 flex justify-center">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-400 text-sm mb-6">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-red-900/20 border border-red-500/30 p-4 rounded mb-6 text-xs text-red-300 max-h-48 overflow-y-auto">
                <summary className="cursor-pointer font-bold mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap break-words">{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap break-words mt-2">{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

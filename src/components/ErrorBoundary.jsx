/**
 * Error Boundary Component
 * Catches React component errors and displays user-friendly error UI
 * Never exposes stack traces to users in production
 * Logs errors for security monitoring
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { logSecurityEvent } from '../utils/securityUtils';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      errorId: null,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Generate error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      errorMessage: 'Something went wrong. Please refresh the page and try again.',
      errorId,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    const { errorId } = this.state;
    
    // Store error info for development debugging
    this.setState({ errorInfo });
    
    // Log error for debugging (but only error type, not full stack to console)
    console.error(`[ERROR BOUNDARY] ${errorId}:`, {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Log as security event for monitoring
    logSecurityEvent('application_error', {
      errorId,
      errorType: error.constructor.name,
      errorMessage: error.message,
      // Do NOT include stack trace - security/privacy risk
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorMessage: '',
      errorId: null,
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#161b22] border border-red-600/50 rounded-lg p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-600/20 rounded-lg">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-center mb-3">Oops!</h1>
            <p className="text-gray-300 text-center mb-4">
              {this.state.errorMessage}
            </p>

            {/* Error ID for Support */}
            <div className="bg-gray-900/50 border border-gray-700 rounded p-3 mb-6">
              <p className="text-xs text-gray-500 mb-1">Error Reference ID:</p>
              <p className="text-xs font-mono text-gray-400 break-all">
                {this.state.errorId}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Please provide this ID if you contact support.
              </p>
            </div>

            {/* What You Can Try */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">What you can try:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Refresh the page</li>
                <li>• Clear your browser cache</li>
                <li>• Try again in a few moments</li>
                <li>• Use a different browser</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold transition-colors"
              >
                Go Home
              </button>
            </div>

            {/* Development Info - ONLY shown in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-600/30 rounded">
                <p className="text-xs text-yellow-600 font-bold mb-2">🔧 Development Info (Not shown in production)</p>
                <p className="text-xs text-yellow-700 font-mono break-all">
                  {this.state.error?.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-yellow-700 cursor-pointer font-bold">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-yellow-600 mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

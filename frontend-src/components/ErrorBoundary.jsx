/**
 * ErrorBoundary.jsx — React Error Boundary
 * 
 * Prevents unhandled component errors from blanking the entire app.
 * Wraps every page route in App.jsx via the LayoutWrapper.
 *
 * Place at: src/components/ErrorBoundary.jsx
 */
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to backend app-logs in production
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      try {
        fetch('/v1/app-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('nexus_access_token')
              ? { Authorization: `Bearer ${localStorage.getItem('nexus_access_token')}` }
              : {}),
          },
          body: JSON.stringify({
            page:     window.location.pathname,
            action:   'error_boundary',
            metadata: {
              error:   error?.message,
              stack:   errorInfo?.componentStack?.slice(0, 500),
            },
          }),
        }).catch(() => {});
      } catch {}
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-red-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900">Something went wrong</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  This section encountered an unexpected error.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDev && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs font-mono text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => { window.location.href = '/'; }}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

/**
 * withErrorBoundary — HOC wrapper
 * Usage: export default withErrorBoundary(MyComponent)
 */
export function withErrorBoundary(Component, fallback) {
  return function WrappedWithErrorBoundary(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;

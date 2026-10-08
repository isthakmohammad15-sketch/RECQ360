import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 md:p-10 flex items-center justify-center min-h-[400px]">
          <div className="bg-[#0F1A2E] border border-red-500/30 rounded-xl p-8 max-w-lg w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-[#E4572E]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">
                {this.props.fallbackTitle || 'Component Render Error'}
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-1">
                An unexpected error prevented this view from rendering normally.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="bg-[#0B1220] border border-white/10 rounded p-3 text-left">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Technical Diagnostics:
                </span>
                <p className="text-xs font-mono text-[#E4572E] break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded bg-[#2E9CCA] hover:bg-[#2587af] text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-slate-300 text-xs font-mono font-bold transition-colors"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

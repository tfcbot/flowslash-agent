import React from "react";
import { AlertCircle, RefreshCw, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: string;
  errorReport?: {
    error: {
      type: string;
      message: string;
      nodeId?: string;
      nodeType?: string;
      recoverable: boolean;
      retryable: boolean;
      timestamp: string;
    };
    recoveryActions: string[];
    userMessage: string;
    context?: any;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  errorReport, 
  onRetry, 
  onDismiss, 
  className = "" 
}: ErrorDisplayProps) {
  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'network':
        return '🌐';
      case 'auth':
        return '🔐';
      case 'validation':
        return '📝';
      case 'timeout':
        return '⏱️';
      case 'execution':
        return '⚙️';
      default:
        return '❌';
    }
  };

  const getErrorColor = (type: string) => {
    switch (type) {
      case 'network':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'auth':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'validation':
        return 'border-purple-500/50 bg-purple-500/10';
      case 'timeout':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'execution':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-red-500/50 bg-red-500/10';
    }
  };

  return (
    <Card className={`${getErrorColor(errorReport?.error.type || 'unknown')} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            {errorReport ? (
              <span className="flex items-center gap-2">
                <span>{getErrorIcon(errorReport.error.type)}</span>
                {errorReport.error.type.charAt(0).toUpperCase() + errorReport.error.type.slice(1)} Error
                {errorReport.error.nodeId && (
                  <span className="text-xs text-white/60">
                    in {errorReport.error.nodeType} node "{errorReport.error.nodeId}"
                  </span>
                )}
              </span>
            ) : (
              "Execution Error"
            )}
          </CardTitle>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-white/70 hover:text-white h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Error Message */}
        <div className="text-sm text-white/90">
          {errorReport?.userMessage || error}
        </div>

        {/* Recovery Actions */}
        {errorReport?.recoveryActions && errorReport.recoveryActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-white/80">
              <Info size={12} />
              Suggested Actions:
            </div>
            <ul className="space-y-1 text-xs text-white/70 ml-4">
              {errorReport.recoveryActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-white/50 mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Details (Collapsible) */}
        {errorReport?.context && (
          <details className="text-xs">
            <summary className="cursor-pointer text-white/60 hover:text-white/80 flex items-center gap-1">
              <ExternalLink size={10} />
              Technical Details
            </summary>
            <div className="mt-2 p-2 bg-black/20 rounded text-white/60 font-mono text-xs overflow-auto max-h-32">
              <pre>{JSON.stringify(errorReport.context, null, 2)}</pre>
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onRetry && errorReport?.error.retryable && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Retry
            </Button>
          )}
          
          {errorReport?.error.recoverable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // Copy error details to clipboard
                const errorDetails = {
                  error: errorReport.error,
                  context: errorReport.context,
                  timestamp: new Date().toISOString(),
                };
                navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
              }}
              className="text-white/60 hover:text-white/80 text-xs"
            >
              Copy Details
            </Button>
          )}
        </div>

        {/* Timestamp */}
        {errorReport?.error.timestamp && (
          <div className="text-xs text-white/40 pt-1 border-t border-white/10">
            Error occurred at {new Date(errorReport.error.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

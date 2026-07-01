import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen p-4"
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-primary)',
          }}
        >
          <div
            className="p-8 rounded-lg shadow-xl max-w-lg w-full text-center border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border-primary)',
            }}
          >
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: 'var(--color-status-error)' }}
            >
              Something went wrong
            </h1>
            <p
              className="mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre
                className="p-4 rounded text-left overflow-auto text-sm mb-6 max-h-48"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-status-error)',
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="font-bold py-2 px-6 rounded transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--color-primary-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

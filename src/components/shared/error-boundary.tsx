import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("FMI Uncaught Error caught by Boundary:", error, errorInfo);
  }

  public reset() {
    this.setState({ hasError: false, error: null });
  }

  public render() {
    if (this.state.hasError) {
      if (React.isValidElement(this.props.fallback)) {
        return React.cloneElement(this.props.fallback as React.ReactElement<any>, { 
          reset: this.reset, 
          error: this.state.error 
        });
      }
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

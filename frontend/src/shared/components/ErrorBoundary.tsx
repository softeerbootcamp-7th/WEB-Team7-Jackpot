import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode | ((reset: () => void) => ReactNode);
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback(this.resetErrorBoundary)
        : this.props.fallback;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

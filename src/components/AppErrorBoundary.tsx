import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AMSS application error", error, info);
  }

  private recover = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-page" role="alert">
        <p className="eyebrow">AMSS · Application error</p>
        <h1>Something went wrong.</h1>
        <p className="subtitle">The application hit an unexpected error. Reload the page to continue.</p>
        <button type="button" onClick={this.recover}>Reload application</button>
      </main>
    );
  }
}

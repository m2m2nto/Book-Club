import type { ReactNode } from 'react';
import { Component } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-rose-700/40 bg-rose-950/30 p-8 text-sm text-rose-200">
          Something went wrong while rendering this page.
        </div>
      );
    }

    return this.props.children;
  }
}

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
        <div className="state-card mx-auto max-w-2xl text-sm">
          <p className="eyebrow text-[color:var(--color-error-base)]">Rendering issue</p>
          <h2 className="mt-3 font-editorial text-3xl leading-none text-[color:var(--color-text-primary)]">
            Something went wrong while rendering this page.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-[color:var(--color-text-secondary)]">
            Try refreshing the page. If the problem continues, go back to the previous screen and try again.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

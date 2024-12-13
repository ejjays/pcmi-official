import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChatErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p>Something went wrong with the chat.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
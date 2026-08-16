import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro não tratado na aplicação:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-plane-light px-4 dark:bg-plane-dark">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-status-critical/10 p-3 text-status-critical">
            <AlertTriangle size={22} />
          </div>
          <h1 className="text-base font-semibold text-ink-primary-light dark:text-ink-primary-dark">
            Algo deu errado
          </h1>
          <p className="text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
            Ocorreu um erro inesperado. Seus dados continuam salvos no navegador — recarregar a
            página costuma resolver.
          </p>
          <Button onClick={() => window.location.reload()}>Recarregar página</Button>
        </div>
      </div>
    );
  }
}

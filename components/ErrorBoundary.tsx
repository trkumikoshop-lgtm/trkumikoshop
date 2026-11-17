import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Error inesperado en la aplicación.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-6">
          <div className="max-w-lg w-full bg-white border-2 border-[#EBDCC5] p-10 shadow-xl text-center space-y-6">
            <h2 className="text-2xl font-serif-jp font-bold text-[#4A3728] uppercase tracking-wider">
              Ha ocurrido un problema
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              No se pudo cargar correctamente el contenido del taller. Intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#4A3728] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

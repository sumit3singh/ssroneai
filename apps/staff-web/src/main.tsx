import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Staff Web POS Error Boundary Caught:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem("ssrone_access_token");
    localStorage.removeItem("ssrone-auth-storage");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8F6F0] p-6 text-center font-sans select-none">
          <div className="w-16 h-16 rounded-full bg-[#0B3B2C] text-[#E5A93C] flex items-center justify-center text-2xl shadow-lg mb-4">
            🍃
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">
            SSR ONE AI – Waiter POS Terminal
          </h1>
          <p className="text-xs text-slate-500 max-w-md mb-4">
            The terminal encountered a transient layout error: {this.state.error?.message || "Unknown error"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#0B3B2C] hover:bg-[#082D22] text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md transition"
            >
              Reload Terminal
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-white border border-[#E8E4DA] text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition"
            >
              Reset Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

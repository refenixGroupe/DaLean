import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, options = {}) => {
      const id = ++toastIdCounter;
      const type = options.type || "info";
      const timeoutMs = options.duration ?? 4000;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (timeoutMs > 0) {
        setTimeout(() => dismiss(id), timeoutMs);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[240px] max-w-sm px-4 py-3 rounded-lg shadow-lg border text-sm flex items-start gap-3 ${
              t.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : t.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          >
            <div className="mt-0.5">
              {t.type === "error" ? "⚠️" : t.type === "success" ? "✅" : "ℹ️"}
            </div>
            <div className="flex-1">{t.message}</div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-xs text-gray-500 hover:text-gray-700"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};


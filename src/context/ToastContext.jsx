import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => {
          let bg = 'bg-white border-border-subtle text-text-main';
          let Icon = Info;
          let iconColor = 'text-secondary-blue';

          if (t.type === 'success') {
            bg = 'bg-[#F4FAF6] border-[#A8D5BA] text-[#1E5234]';
            Icon = CheckCircle2;
            iconColor = 'text-[#2E7D32]';
          } else if (t.type === 'error') {
            bg = 'bg-[#FDF2F2] border-[#F8B4B4] text-[#9B1C1C]';
            Icon = AlertCircle;
            iconColor = 'text-[#C81E1E]';
          } else if (t.type === 'warning') {
            bg = 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]';
            Icon = AlertTriangle;
            iconColor = 'text-[#D97706]';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${bg}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-snug">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-text-muted hover:text-text-main transition-colors p-0.5"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

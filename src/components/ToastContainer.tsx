import React from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 min-w-72 max-w-sm ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-150'
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-150'
              : 'bg-indigo-50 text-indigo-800 border-indigo-150'
          }`}
        >
          {toast.type === 'success' && (
            <span className="text-emerald-500 font-bold" aria-hidden="true">✓</span>
          )}
          {toast.type === 'error' && (
            <span className="text-rose-500 font-bold" aria-hidden="true">✗</span>
          )}
          {toast.type === 'info' && (
            <span className="text-indigo-500 font-bold" aria-hidden="true">ℹ</span>
          )}
          <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-auto text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-hidden text-base leading-none font-bold"
            aria-label="Fechar notificação"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

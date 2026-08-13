'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export function toast(message: string, type: ToastType = 'success', duration = 4000) {
  const id = Math.random().toString(36).slice(2);
  const toastMsg: ToastMessage = { id, type, message, duration };
  toastListeners.forEach((listener) => listener(toastMsg));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toastMsg: ToastMessage) => {
      setToasts((prev) => [...prev, toastMsg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastMsg.id));
      }, toastMsg.duration || 4000);
    };

    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    warning: 'bg-white border-amber-100',
    info: 'bg-white border-blue-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto
            min-w-[280px] max-w-[380px] animate-slide-up ${bgColors[t.type]}`}
        >
          {icons[t.type]}
          <p className="text-sm font-medium text-gray-800 flex-1">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

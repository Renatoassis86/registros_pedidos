"use client";
import React, { createContext, useContext, useState } from 'react';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

const ToastContext = createContext<((msg: string, type?: Toast['type']) => void) | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast ${t.type} animate-fade`}>
                        {t.message}
                    </div>
                ))}
            </div>
            <style jsx>{`
        .toast-container { position: fixed; bottom: 2rem; right: 2rem; display: flex; flex-direction: column; gap: 0.75rem; z-index: 9999; }
        .toast { 
          padding: 1rem 1.5rem; 
          border-radius: var(--radius-md); 
          color: white; 
          font-weight: 600; 
          box-shadow: var(--shadow-lg);
          min-width: 280px;
        }
        .success { background: #10b981; }
        .error { background: #ef4444; }
        .info { background: var(--secondary); }
      `}</style>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

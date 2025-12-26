
import React from 'react';
import { useUIStore } from '../stores/uiStore';

const ToastContainer: React.FC = () => {
  const toasts = useUIStore(state => state.toasts);

  return (
    <div className="fixed top-2 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="bg-black/80 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10 shadow-2xl animate-in slide-in-from-top-10 duration-500 flex items-center gap-3"
        >
          {toast.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-400" />}
          {toast.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
          <span className="text-[11px] font-bold tracking-tight text-white/90">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

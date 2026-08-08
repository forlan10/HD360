import type { FC } from 'react';
import { Loader2, AlertCircle, X } from 'lucide-react';

export const LoadingState: FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
    <Loader2 className="w-8 h-8 animate-spin text-xbox-400 mb-3" />
    <p className="text-sm">{text}</p>
  </div>
);

export const ErrorState: FC<{ text: string; onRetry: () => void }> = ({ text, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
    <p className="text-sm text-neutral-400 mb-3">{text}</p>
    <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-xbox-500 text-white text-sm font-semibold hover:bg-xbox-400 transition-all">
      Tentar novamente
    </button>
  </div>
);

export const EmptyState: FC<{ icon: React.ComponentType<{ className?: string }>; text: string }> = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
    <Icon className="w-10 h-10 mb-3 opacity-50" />
    <p className="text-sm">{text}</p>
  </div>
);

export const Modal: FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const Field: FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{label}</label>
    {children}
    {hint && <p className="text-xs text-neutral-600 mt-1.5">{hint}</p>}
  </div>
);

export const inputClass =
  'w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-xbox-500 focus:ring-1 focus:ring-xbox-500 transition-colors';

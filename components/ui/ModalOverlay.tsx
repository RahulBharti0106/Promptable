import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ModalOverlayProps {
  children: React.ReactNode;
  title?: string;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user ? '/dashboard' : '/');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBack}
    >
      <div 
        className="relative w-full max-w-lg bg-surface border border-slate-800 rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-6 left-6">
          <button 
            onClick={handleBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        
        <div className="absolute top-6 right-6">
          <button 
            onClick={handleBack}
            className="p-2 text-slate-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {title && <h2 className="text-center text-2xl font-bold text-white mb-8">{title}</h2>}
        
        {children}
      </div>
    </div>
  );
};
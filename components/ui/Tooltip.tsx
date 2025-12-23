import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute top-full mt-2 z-[60] animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-slate-700 whitespace-nowrap shadow-xl">
            {content}
          </div>
          <div className="w-2 h-2 bg-slate-900 border-l border-t border-slate-700 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};
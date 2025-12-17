import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>}
        <input
          className={twMerge(
            "flex h-10 w-full rounded-lg border border-slate-700 bg-surfaceHighlight px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>}
        <textarea
          className={twMerge(
            "flex min-h-[80px] w-full rounded-lg border border-slate-700 bg-surfaceHighlight px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
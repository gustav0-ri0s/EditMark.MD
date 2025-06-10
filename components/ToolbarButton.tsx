
import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  isActive?: boolean;
  className?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, children, title, isActive, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-all duration-150 ${
        isActive 
          ? 'bg-sky-500 text-white' 
          : 'bg-slate-200 hover:bg-slate-300/80 text-slate-600 hover:text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600/80 dark:text-slate-300 dark:hover:text-slate-100'
      } ${className || ''}`}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );
};
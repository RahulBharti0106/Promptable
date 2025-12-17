import React from 'react';
import { twMerge } from 'tailwind-merge';

const CATEGORIES = [
  'coding', 'frontend', 'backend', 'design', 'study', 
  'productivity', 'startup', 'marketing', 'resume', 'other'
];

interface CategoryChipsProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  variant?: 'filter' | 'select';
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ 
  selectedCategories, 
  onChange,
  variant = 'filter'
}) => {
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      onChange(selectedCategories.filter(c => c !== cat));
    } else {
      onChange([...selectedCategories, cat]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => {
        const isSelected = selectedCategories.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => toggleCategory(cat)}
            className={twMerge(
              "rounded-full px-3 py-1 text-xs font-medium transition-all border",
              isSelected 
                ? "bg-primary/20 border-primary text-primary hover:bg-primary/30" 
                : "bg-surfaceHighlight border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            )}
          >
            #{cat}
          </button>
        );
      })}
    </div>
  );
};
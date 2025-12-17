import React, { useState } from 'react';
import { Prompt } from '../../types';
import { Copy, Edit2, Globe, Lock, Trash2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns'; // Requires date-fns, but we'll use simple fallback to avoid extra install deps for user if possible.
// Actually, let's use a simple date helper to keep it dependency-free-ish or standard.

interface PromptCardProps {
  prompt: Prompt;
  showOwnerActions?: boolean;
  onDelete?: () => void;
  onTogglePublic?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  showOwnerActions = false,
  onDelete,
  onTogglePublic
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link 
      to={`/prompt/${prompt.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="line-clamp-1 text-lg font-semibold text-slate-100 group-hover:text-primary transition-colors">
              {prompt.title}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {prompt.categories.slice(0, 3).map(cat => (
                <span key={cat} className="text-xs text-slate-500">#{cat}</span>
              ))}
            </div>
          </div>
          <div className="ml-4 flex items-center space-x-1">
            {showOwnerActions && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); onTogglePublic?.(); }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                  title={prompt.is_public ? "Make Private" : "Make Public"}
                >
                  {prompt.is_public ? <Globe size={16} /> : <Lock size={16} />}
                </button>
                <Link
                  to={`/prompts/${prompt.id}/edit`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); onDelete?.(); }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={handleCopy}
              className={`rounded-lg p-2 transition-colors ${copied ? 'text-green-400 bg-green-400/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-400">
          {prompt.description || prompt.body}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
        <div className="flex items-center space-x-2">
          {prompt.profiles?.avatar_url ? (
            <img src={prompt.profiles.avatar_url} alt="Avatar" className="h-6 w-6 rounded-full" />
          ) : (
             <div className="h-6 w-6 rounded-full bg-slate-700" />
          )}
          <span className="text-xs font-medium text-slate-500">
            {prompt.profiles?.display_name || "Unknown"}
          </span>
        </div>
        <span className="text-xs text-slate-600">
          {new Date(prompt.created_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
};
import React, { useState, useEffect } from 'react';
import { Prompt } from '../../types';
import { Globe, Lock, Trash2, Heart, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socialActions } from '../../lib/socialActions';
import { supabase as client } from '../../lib/supabaseClient';
import { usePromptStats } from '../../hooks/usePromptStats';
import { CommentsPanel } from '../CommentsPanel';

interface PromptCardProps {
  prompt: Prompt;
  showOwnerActions?: boolean;
  onDelete?: () => void;
  onTogglePublic?: () => void;
  isLiked?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  onDelete,
  onTogglePublic,
  isLiked: initialIsLiked = false
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showComments, setShowComments] = useState(false);
  const { likesCount, commentsCount } = usePromptStats(prompt.id, prompt.likes_count);

  const isFounder = profile?.role === 'owner' || profile?.display_name?.toLowerCase().includes('founder');
  const isOwner = user?.id === prompt.user_id;
  const canDelete = isFounder || isOwner;

  useEffect(() => {
    if (user) {
      client.from('prompt_likes').select('id').match({ prompt_id: prompt.id, user_id: user.id }).single().then(({ data }) => {
        setIsLiked(!!data);
      });
    }
  }, [user, prompt.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return navigate('/login');
    try {
      if (isLiked) {
        setIsLiked(false);
        await client.from('prompt_likes').delete().match({ prompt_id: prompt.id, user_id: user.id });
      } else {
        setIsLiked(true);
        await client.from('prompt_likes').insert({ prompt_id: prompt.id, user_id: user.id });
      }
    } catch (err) { console.error(err); }
  };

  const handleRemix = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return navigate('/login');
    if (confirm('Remix this prompt? This will create a private copy in your dashboard.')) {
      const newPrompt = await socialActions.remixPrompt(prompt, user.id);
      navigate(`/prompts/${newPrompt.id}/edit`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (confirm('Delete this prompt forever?')) onDelete?.();
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-surface shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 overflow-hidden">
      <Link to={`/prompt/${prompt.id}`} className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <Link to={`/user/${prompt.user_id}`} onClick={e => e.stopPropagation()} className="flex items-center space-x-2">
            {prompt.profiles?.avatar_url ? (
              <img src={prompt.profiles.avatar_url} className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                {prompt.profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-400">@{prompt.profiles?.display_name || 'user'}</span>
              {isFounder && <ShieldCheck size={10} className="text-primary" />}
            </div>
          </Link>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
             {isOwner && (
               <button onClick={e => { e.preventDefault(); e.stopPropagation(); onTogglePublic?.(); }} className="p-1.5 text-slate-500 hover:text-white">
                 {prompt.is_public ? <Globe size={14} /> : <Lock size={14} />}
               </button>
             )}
             {canDelete && (
               <button onClick={handleDelete} className="p-1.5 text-slate-500 hover:text-red-400">
                 <Trash2 size={14} />
               </button>
             )}
          </div>
        </div>

        <h3 className="line-clamp-1 text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">{prompt.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-400">{prompt.description || prompt.body}</p>
      </Link>

      <div className="bg-slate-900/50 px-5 py-3 border-t border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={handleLike} className={`flex items-center space-x-1.5 text-xs font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}>
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likesCount}</span>
          </button>
          
          <button 
            onClick={e => { e.preventDefault(); e.stopPropagation(); setShowComments(true); }}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-white"
          >
            <MessageSquare size={16} />
            <span>{commentsCount}</span>
          </button>
        </div>

        <button onClick={handleRemix} className="rounded-lg p-2 text-slate-500 hover:text-primary transition-colors" title="Remix">
          <ExternalLink size={16} />
        </button>
      </div>

      {showComments && <CommentsPanel promptId={prompt.id} onClose={() => setShowComments(false)} />}
    </div>
  );
};
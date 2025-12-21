import React, { useState, useEffect } from 'react';
import { Prompt } from '../../types';
import { Copy, Globe, Lock, Trash2, Check, Heart, Repeat, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socialActions } from '../../lib/socialActions';
import { supabase as client } from '../../lib/supabaseClient';

interface PromptCardProps {
  prompt: Prompt;
  showOwnerActions?: boolean;
  onDelete?: () => void;
  onTogglePublic?: () => void;
  isLiked?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  showOwnerActions = false,
  onDelete,
  onTogglePublic,
  isLiked: initialIsLiked = false
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(prompt.likes_count || 0);

  // Check if current viewer is the global owner (founder)
  const isFounder = profile?.role === 'owner';
  const canModerate = isFounder || user?.id === prompt.user_id;

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, prompt.id]);

  const checkIfLiked = async () => {
    const { data } = await client
      .from('prompt_likes')
      .select('id')
      .match({ prompt_id: prompt.id, user_id: user?.id })
      .single();
    setIsLiked(!!data);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.body);
    setCopied(true);
    socialActions.incrementCopyCount(prompt.id);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        await client.from('prompt_likes').delete().match({ prompt_id: prompt.id, user_id: user.id });
        await client.from('prompts').update({ likes_count: Math.max(0, likesCount - 1) }).eq('id', prompt.id);
      } else {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        await client.from('prompt_likes').insert({ prompt_id: prompt.id, user_id: user.id });
        await client.from('prompts').update({ likes_count: likesCount + 1 }).eq('id', prompt.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemix = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (confirm('Remix this prompt? This will create a private copy in your dashboard.')) {
      const newPrompt = await socialActions.remixPrompt(prompt, user.id);
      navigate(`/prompts/${newPrompt.id}/edit`);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-surface shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 overflow-hidden">
      <Link to={`/prompt/${prompt.id}`} className="p-5 flex-1">
        {/* Creator Header */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to={`/user/${prompt.user_id}`} 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            {prompt.profiles?.avatar_url ? (
              <img src={prompt.profiles.avatar_url} alt="Avatar" className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                {prompt.profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-400">@{prompt.profiles?.display_name || 'anonymous'}</span>
              {prompt.profiles?.role === 'owner' && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                  <ShieldCheck size={10} className="mr-0.5" /> Founder
                </span>
              )}
            </div>
          </Link>
          
          <div className="flex items-center space-x-1">
             {/* Owner or Founder can moderate/toggle public state */}
             {canModerate && (
               <>
                 <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTogglePublic?.(); }} 
                  className="p-1.5 text-slate-500 hover:text-white transition-colors"
                  title={prompt.is_public ? "Make Private" : "Make Public"}
                >
                   {prompt.is_public ? <Globe size={14} /> : <Lock size={14} />}
                 </button>
                 <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(); }} 
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete Prompt"
                >
                   <Trash2 size={14} />
                 </button>
               </>
             )}
          </div>
        </div>

        <h3 className="line-clamp-1 text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">
          {prompt.title}
        </h3>
        
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
          {prompt.description || prompt.body}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {prompt.categories.slice(0, 2).map(cat => (
            <span key={cat} className="text-[10px] font-bold uppercase tracking-wider text-slate-600">#{cat}</span>
          ))}
        </div>
      </Link>

      {/* Social Footer Actions */}
      <div className="bg-slate-900/50 px-5 py-3 border-t border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1.5 text-xs font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likesCount}</span>
          </button>
          
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-500" title="Remixes">
            <Repeat size={16} />
            <span>{prompt.remixes_count || 0}</span>
          </div>

          <button 
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 text-xs font-medium transition-colors ${copied ? 'text-green-400' : 'text-slate-500 hover:text-white'}`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{prompt.copies_count || 0}</span>
          </button>
        </div>

        <button 
          onClick={handleRemix}
          className="rounded-lg p-2 text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors"
          title="Remix this prompt"
        >
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
};
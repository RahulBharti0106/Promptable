import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Heart, User, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PromptComment } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { TextArea } from './ui/Input';

interface CommentsPanelProps {
  promptId: string;
  onClose: () => void;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({ promptId, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<PromptComment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [promptId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('prompt_comments')
      .select('*, profiles(*)')
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: false });
    if (data) setComments(data as unknown as PromptComment[]);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!user || !text.trim()) return;
    const { data, error } = await supabase
      .from('prompt_comments')
      .insert({ prompt_id: promptId, user_id: user.id, body: text.trim() })
      .select('*, profiles(*)')
      .single();
    
    if (data) {
      setComments([data as unknown as PromptComment, ...comments]);
      setText('');
    }
  };

  return (
    <div className="fixed top-0 right-0 z-[110] h-full w-full max-w-md bg-surface border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center">
          <MessageSquare size={18} className="mr-2 text-primary" />
          Comments
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center text-slate-500 py-10">Loading...</div>
        ) : comments.map(comment => (
          <div key={comment.id} className="flex space-x-3">
             <div className="h-8 w-8 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} className="h-full w-full object-cover" />
                ) : (
                  <User size={14} className="text-slate-500" />
                )}
             </div>
             <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                   <span className="text-xs font-bold text-slate-300">
                      @{comment.profiles?.display_name || 'user'}
                   </span>
                   {comment.profiles?.role === 'owner' && <ShieldCheck size={12} className="text-primary" />}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-xl rounded-tl-none">
                  {comment.body}
                </p>
             </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-900/20">
        {user ? (
          <div className="space-y-3">
            <TextArea 
              placeholder="Add a comment..." 
              value={text} 
              onChange={e => setText(e.target.value)} 
              className="min-h-[60px]"
            />
            <Button onClick={handlePost} className="w-full" disabled={!text.trim()}>
              <Send size={14} className="mr-2" />
              Post
            </Button>
          </div>
        ) : (
          <p className="text-sm text-center text-slate-500">Sign in to join the discussion.</p>
        )}
      </div>
    </div>
  );
};
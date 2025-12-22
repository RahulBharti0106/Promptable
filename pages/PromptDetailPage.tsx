import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Prompt, PromptComment } from '../types';
import { Button } from '../components/ui/Button';
import { TextArea } from '../components/ui/Input';
import { Copy, Check, ArrowLeft, Calendar, User, Heart, ExternalLink, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { socialActions } from '../lib/socialActions';

export const PromptDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [comments, setComments] = useState<PromptComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPrompt();
      fetchComments();
    }
  }, [id]);

  const fetchPrompt = async () => {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
    } else {
      setPrompt(data as unknown as Prompt);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('prompt_comments')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url,
          role
        )
      `)
      .eq('prompt_id', id)
      .order('created_at', { ascending: false });
    
    if (data) setComments(data as unknown as PromptComment[]);
  };

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      socialActions.incrementCopyCount(prompt.id);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemix = async () => {
    if (!user) return navigate('/login');
    if (prompt) {
      const newPrompt = await socialActions.remixPrompt(prompt, user.id);
      navigate(`/prompts/${newPrompt.id}/edit`);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);
    const { data, error } = await supabase
      .from('prompt_comments')
      .insert({
        prompt_id: id,
        user_id: user.id,
        body: newComment.trim()
      })
      .select(`
        *,
        profiles (
          display_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (!error && data) {
      setComments([data as unknown as PromptComment, ...comments]);
      setNewComment('');
    }
    setSubmittingComment(false);
  };

  if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading prompt...</div>;
  if (!prompt) return <div className="p-10 text-center text-slate-500">Prompt not found.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="mb-8 inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Library
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">{prompt.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <Link to={`/user/${prompt.user_id}`} className="flex items-center space-x-2 text-primary hover:underline">
                {prompt.profiles?.avatar_url ? (
                  <img src={prompt.profiles.avatar_url} className="h-6 w-6 rounded-full" />
                ) : (
                  <User size={16} />
                )}
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-semibold">@{prompt.profiles?.display_name || 'creator'}</span>
                  {prompt.profiles?.role === 'owner' && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                      <ShieldCheck size={10} className="mr-0.5" /> Founder
                    </span>
                  )}
                </div>
              </Link>
              <span className="text-slate-600">•</span>
              <div className="flex items-center text-sm text-slate-400">
                <Calendar size={14} className="mr-2" />
                {new Date(prompt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-surface overflow-hidden">
            <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Prompt Body</h2>
              <div className="flex items-center space-x-2">
                 <Button onClick={handleCopy} className="h-8 px-3 text-xs" variant={copied ? "secondary" : "primary"}>
                   {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                   {copied ? "Copied" : "Copy"}
                 </Button>
                 <Button onClick={handleRemix} variant="secondary" className="h-8 px-3 text-xs">
                   <ExternalLink size={14} className="mr-1.5" /> Remix
                 </Button>
              </div>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed text-slate-200 bg-background/50 selection:bg-primary/30 whitespace-pre-wrap">
              {prompt.body}
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-slate-800">
            <h3 className="text-xl font-bold text-white flex items-center">
              <MessageSquare size={20} className="mr-2 text-primary" />
              Comments ({comments.length})
            </h3>

            {user ? (
              <form onSubmit={handlePostComment} className="flex space-x-4">
                <div className="flex-1">
                  <TextArea 
                    placeholder="Add to the discussion..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-surface border-slate-700"
                  />
                </div>
                <Button type="submit" isLoading={submittingComment} disabled={!newComment.trim()} className="self-end h-10 px-4">
                  <Send size={16} />
                </Button>
              </form>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-400 mb-4 text-sm">Sign in to share your thoughts on this prompt.</p>
                <Link to="/login">
                  <Button variant="secondary" className="text-xs">Log In</Button>
                </Link>
              </div>
            )}

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4 group">
                  <Link to={`/user/${comment.user_id}`} className="mt-1">
                    {comment.profiles?.avatar_url ? (
                      <img src={comment.profiles.avatar_url} className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                        {comment.profiles?.display_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link to={`/user/${comment.user_id}`} className="text-sm font-bold text-slate-300 hover:text-primary transition-colors">
                        {comment.profiles?.display_name || 'anonymous'}
                      </Link>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed bg-surfaceHighlight/30 p-3 rounded-xl rounded-tl-none">
                      {comment.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-surface p-6 space-y-6 sticky top-24">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Context</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {prompt.description || "The creator didn't provide usage instructions, but the prompt should be straightforward."}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {prompt.categories.map(cat => (
                  <span key={cat} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300">
                    #{cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-white">{prompt.likes_count}</p>
                <p className="text-[10px] text-slate-600 uppercase font-black">Likes</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{prompt.remixes_count}</p>
                <p className="text-[10px] text-slate-600 uppercase font-black">Remixes</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{prompt.copies_count}</p>
                <p className="text-[10px] text-slate-600 uppercase font-black">Copies</p>
              </div>
            </div>

            <Button onClick={handleCopy} className="w-full py-4 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
              {copied ? <Check className="mr-2" /> : <Copy className="mr-2" />}
              {copied ? "Copied!" : "Copy Prompt"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
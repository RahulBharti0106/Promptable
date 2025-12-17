import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Prompt } from '../types';
import { Button } from '../components/ui/Button';
import { Copy, Check, ArrowLeft, Calendar, User } from 'lucide-react';

export const PromptDetailPage = () => {
  const { id } = useParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) fetchPrompt();
  }, [id]);

  const fetchPrompt = async () => {
    const { data, error } = await supabase
      .from('prompts')
      .select('*, profiles(display_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) console.error(error);
    else setPrompt(data as Prompt);
    setLoading(false);
  };

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading...</div>;
  if (!prompt) return <div className="p-10 text-center text-slate-500">Prompt not found or private.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={16} className="mr-1" /> Back to Feed
      </Link>

      <div className="mb-6">
        <h1 className="mb-4 text-3xl font-bold text-white">{prompt.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center">
            <User size={16} className="mr-2" />
            {prompt.profiles?.display_name || 'Unknown Author'}
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-2" />
            {new Date(prompt.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            {prompt.categories.map(cat => (
              <span key={cat} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                #{cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-700 bg-surface p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Prompt</h2>
          <Button onClick={handleCopy} variant={copied ? "secondary" : "primary"}>
            {copied ? <><Check size={16} className="mr-2" /> Copied</> : <><Copy size={16} className="mr-2" /> Copy to Clipboard</>}
          </Button>
        </div>
        <div className="whitespace-pre-wrap rounded-xl bg-background p-4 font-mono text-sm leading-relaxed text-slate-200 shadow-inner">
          {prompt.body}
        </div>
      </div>

      {prompt.description && (
        <div className="rounded-2xl border border-slate-800 bg-surfaceHighlight/50 p-6">
          <h3 className="mb-3 font-semibold text-white">How to use</h3>
          <p className="text-slate-400">{prompt.description}</p>
        </div>
      )}
    </div>
  );
};
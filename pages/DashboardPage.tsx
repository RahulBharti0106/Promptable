import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConnected } from '../lib/supabaseClient';
import { Prompt } from '../types';
import { PromptCard } from '../components/ui/PromptCard';
import { Button } from '../components/ui/Button';
import { Plus, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    if (user && isSupabaseConnected) {
      fetchUserPrompts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserPrompts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prompts')
      .select('*, profiles(display_name, avatar_url)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user prompts:', error.message || error);
    } else {
      setPrompts(data as Prompt[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (!error) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const handleTogglePublic = async (prompt: Prompt) => {
    const { error } = await supabase
      .from('prompts')
      .update({ is_public: !prompt.is_public })
      .eq('id', prompt.id);
    
    if (!error) {
      setPrompts(prompts.map(p => p.id === prompt.id ? { ...p, is_public: !p.is_public } : p));
    }
  };

  const filteredPrompts = prompts.filter(p => {
    if (filter === 'public') return p.is_public;
    if (filter === 'private') return !p.is_public;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Manage your collection</p>
        </div>
        <Link to="/prompts/new">
          <Button>
            <Plus size={18} className="mr-2" /> Create Prompt
          </Button>
        </Link>
      </div>

      {!isSupabaseConnected ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-surface/50 py-20 text-center">
          <Database className="mb-4 h-12 w-12 text-slate-600" />
          <h3 className="text-xl font-semibold text-white">Database Not Connected</h3>
          <p className="mt-2 max-w-md text-slate-400">
            Please connect your Supabase project to manage your prompts.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex space-x-2 border-b border-slate-800 pb-1">
            {(['all', 'public', 'private'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-surfaceHighlight text-primary' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({
                  f === 'all' ? prompts.length : prompts.filter(p => f === 'public' ? p.is_public : !p.is_public).length
                })
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500">Loading your prompts...</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPrompts.map(prompt => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt}
                  showOwnerActions
                  onDelete={() => handleDelete(prompt.id)}
                  onTogglePublic={() => handleTogglePublic(prompt)}
                />
              ))}
              {filteredPrompts.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-slate-800 py-20 text-center">
                  <p className="text-slate-500">No prompts found in this section.</p>
                  <Link to="/prompts/new" className="mt-4 inline-block text-primary hover:underline">Create your first one</Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
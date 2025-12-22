import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabaseClient';
import { Prompt } from '../types';
import { PromptCard } from '../components/ui/PromptCard';
import { CategoryChips } from '../components/ui/CategoryChips';
import { Input } from '../components/ui/Input';
import { Search, Database, TrendingUp, Clock } from 'lucide-react';

export const HomePage = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'trending'>('trending');

  useEffect(() => {
    if (isSupabaseConnected) {
      fetchPrompts();
    } else {
      setLoading(false);
    }
  }, [selectedCategories, sortBy]);

  const fetchPrompts = async () => {
    setLoading(true);

    // Explicit join syntax for joining profiles
    let query = supabase
      .from('prompts')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url,
          role
        )
      `)
      .eq('is_public', true);

    if (sortBy === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else {
      // Sorting by trending: likes_count desc
      query = query.order('likes_count', { ascending: false });
    }

    if (selectedCategories.length > 0) {
      query = query.contains('categories', selectedCategories);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching prompts:', error.message || error);
    } else {
      setPrompts(data as unknown as Prompt[]);
    }
    setLoading(false);
  };

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
          Discover the best <span className="text-primary font-mono tracking-tighter">AI PROMPTS</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          Join the creator community sharing high-performance prompts for the world's most powerful LLMs.
        </p>
      </div>

      <div className="mb-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Search by title or description..."
              className="pl-10 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-surfaceHighlight p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'trending' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <TrendingUp size={16} />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'latest' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Clock size={16} />
              <span>Latest</span>
            </button>
          </div>
        </div>

        <CategoryChips
          selectedCategories={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>

      {!isSupabaseConnected ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-surface/50 py-20 text-center">
          <Database className="mb-4 h-12 w-12 text-slate-600" />
          <h3 className="text-xl font-semibold text-white">Database Not Connected</h3>
          <p className="mt-2 max-w-md text-slate-400">
            Check your console or set up your Supabase project keys in environment variables.
          </p>
        </div>
      ) : loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-surface animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
          {filteredPrompts.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No results for this search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabaseClient';
import { Prompt } from '../types';
import { PromptCard } from '../components/ui/PromptCard';
import { CategoryChips } from '../components/ui/CategoryChips';
import { Input } from '../components/ui/Input';
import { Search, Database } from 'lucide-react';

export const HomePage = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isSupabaseConnected) {
      fetchPrompts();
    } else {
      setLoading(false);
    }
  }, [selectedCategories]);

  const fetchPrompts = async () => {
    setLoading(true);
    let query = supabase
      .from('prompts')
      .select('*, profiles(display_name, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (selectedCategories.length > 0) {
      query = query.contains('categories', selectedCategories);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching prompts:', error.message || error);
    } else {
      setPrompts(data as Prompt[]);
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
          Discover the best <span className="text-primary">AI Prompts</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          A community-driven library to find, share, and organize prompts for ChatGPT, Claude, and Gemini.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
          <Input 
            placeholder="Search prompts..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
            Please connect your Supabase project by adding <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment variables.
          </p>
        </div>
      ) : loading ? (
        <div className="text-center text-slate-500 py-20">Loading prompts...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
          {filteredPrompts.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              No prompts found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
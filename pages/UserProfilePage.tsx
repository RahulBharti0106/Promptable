import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Prompt, Profile } from '../types';
import { PromptCard } from '../components/ui/PromptCard';
import { User, Globe, Grid, Share2 } from 'lucide-react';

export const UserProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUserContent();
    }
  }, [id]);

  const fetchUserContent = async () => {
    setLoading(true);
    // Fetch Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (profileData) setProfile(profileData as Profile);

    // Fetch Public Prompts
    const { data: promptsData } = await supabase
      .from('prompts')
      .select('*, profiles(display_name, avatar_url)')
      .eq('user_id', id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (promptsData) setPrompts(promptsData as Prompt[]);
    
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500">Loading profile...</div>;
  if (!profile) return <div className="p-20 text-center text-slate-500">Creator not found.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Profile Header */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="relative mb-6">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="h-32 w-32 rounded-full border-4 border-surfaceHighlight shadow-2xl object-cover" />
          ) : (
            <div className="h-32 w-32 rounded-full bg-slate-800 flex items-center justify-center text-5xl font-bold text-slate-600">
              {profile.display_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-full border-4 border-background">
            <Globe size={16} />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2">@{profile.display_name || 'anonymous'}</h1>
        <p className="text-slate-400 max-w-md">Community Creator since {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        
        <div className="mt-8 flex space-x-8">
           <div className="text-center">
             <p className="text-2xl font-bold text-white">{prompts.length}</p>
             <p className="text-xs uppercase tracking-widest text-slate-500 font-black">Prompts</p>
           </div>
           <div className="text-center">
             <p className="text-2xl font-bold text-white">
               {prompts.reduce((acc, p) => acc + (p.likes_count || 0), 0)}
             </p>
             <p className="text-xs uppercase tracking-widest text-slate-500 font-black">Likes</p>
           </div>
           <div className="text-center">
             <p className="text-2xl font-bold text-white">
               {prompts.reduce((acc, p) => acc + (p.copies_count || 0), 0)}
             </p>
             <p className="text-xs uppercase tracking-widest text-slate-500 font-black">Copies</p>
           </div>
        </div>
      </div>

      <div className="mb-8 flex items-center space-x-2 border-b border-slate-800 pb-2">
         <Grid size={18} className="text-primary" />
         <h2 className="text-sm font-black uppercase tracking-widest text-white">Public Prompts</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map(prompt => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
        {prompts.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">This creator hasn't published any public prompts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
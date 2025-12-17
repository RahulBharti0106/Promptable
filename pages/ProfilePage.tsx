import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (data) {
      setDisplayName(data.display_name || '');
      setAvatarUrl(data.avatar_url || '');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user!.id,
        display_name: displayName,
        avatar_url: avatarUrl,
      });

    if (error) {
      alert('Error updating profile');
    } else {
      alert('Profile updated!');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Profile Settings</h1>
      
      <div className="rounded-2xl border border-slate-800 bg-surface p-8">
        <form onSubmit={handleUpdate} className="space-y-6">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="Avatar URL (Image Link)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/me.png"
          />
          {avatarUrl && (
            <div className="mt-2">
               <span className="mb-2 block text-sm text-slate-400">Preview:</span>
               <img src={avatarUrl} alt="Avatar Preview" className="h-20 w-20 rounded-full object-cover border-2 border-slate-700" />
            </div>
          )}
          
          <Button type="submit" isLoading={loading}>
            Update Profile
          </Button>
        </form>
      </div>
    </div>
  );
};
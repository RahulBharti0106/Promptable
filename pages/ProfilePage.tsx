import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ModalOverlay } from '../components/ui/ModalOverlay';
import { Upload, User, Loader2 } from 'lucide-react';
import { uploadAvatar } from '../lib/supabaseStorage';

export const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      setAvatarUrl(url);
      // Automatically save to profile
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      await refreshProfile();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, avatar_url: avatarUrl })
      .eq('id', user!.id);

    if (!error) {
      await refreshProfile();
      alert('Profile updated!');
    }
    setLoading(false);
  };

  return (
    <ModalOverlay title="Profile Settings">
      <div className="flex flex-col items-center mb-8">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} className="h-full w-full object-cover" />
            ) : (
              <User size={40} className="text-slate-600" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Upload size={20} className="text-white" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">Click to upload image</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Choose a cool username"
        />
        
        <Button type="submit" className="w-full" isLoading={loading}>
          Update Profile
        </Button>
      </form>
    </ModalOverlay>
  );
};
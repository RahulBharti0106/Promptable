import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';

const FOUNDER_EMAIL = 'rahul433108k@gmail.com';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      let currentProfile = data as Profile | null;

      // Auto-upsert profile if it doesn't exist
      if (!currentProfile) {
        const role = email === FOUNDER_EMAIL ? 'owner' : 'user';
        const { data: newProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            display_name: email?.split('@')[0] || 'User',
            role: role
          })
          .select()
          .single();
        
        if (!upsertError) {
          currentProfile = newProfile as Profile;
        }
      } else if (email === FOUNDER_EMAIL && currentProfile.role !== 'owner') {
        // Force upgrade founder if email matches but role is wrong
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({ role: 'owner' })
          .eq('id', userId)
          .select()
          .single();
        if (updatedProfile) currentProfile = updatedProfile as Profile;
      }

      setProfile(currentProfile);
    } catch (err) {
      console.error('Auth Profile Fetch Error:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user.email);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
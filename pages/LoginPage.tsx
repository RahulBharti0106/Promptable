import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-surface p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Welcome Back</h2>
        {error && <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
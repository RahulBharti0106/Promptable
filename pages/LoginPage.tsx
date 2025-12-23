import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldAlert, MailCheck } from 'lucide-react';
import { ModalOverlay } from '../components/ui/ModalOverlay';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsUnconfirmed(false);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('email not confirmed')) {
        setIsUnconfirmed(true);
        setError('Your email is not confirmed yet. Please check your inbox for a confirmation link.');
      } else {
        setError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
      }
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <ModalOverlay title="Welcome Back">
      {error && (
        <div className={`mb-6 flex items-start space-x-3 rounded-lg p-3 text-sm ${isUnconfirmed ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {isUnconfirmed ? <MailCheck className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
          <span>{error}</span>
        </div>
      )}
      
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

      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
      </p>
    </ModalOverlay>
  );
};
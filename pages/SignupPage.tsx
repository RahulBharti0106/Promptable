import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MailCheck } from 'lucide-react';
import { ModalOverlay } from '../components/ui/ModalOverlay';

export const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.session) {
        navigate('/dashboard');
      } else {
        setIsSuccess(true);
        setLoading(false);
      }
    }
  };

  if (isSuccess) {
    return (
      <ModalOverlay title="Check your email">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
            <MailCheck size={32} />
          </div>
          <p className="mb-8 text-slate-400">
            We've sent a confirmation link to <span className="text-white font-medium">{email}</span>. 
          </p>
          <Link to="/login" className="w-full">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay title="Create Account">
      {error && <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">{error}</div>}
      
      <form onSubmit={handleSignup} className="space-y-4">
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
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
      </p>
    </ModalOverlay>
  );
};
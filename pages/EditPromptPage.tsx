import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Input, TextArea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CategoryChips } from '../components/ui/CategoryChips';
import { ModalOverlay } from '../components/ui/ModalOverlay';

export const EditPromptPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    description: '',
    categories: [] as string[],
    is_public: false
  });

  useEffect(() => {
    if (id) {
      const fetchPrompt = async () => {
        const { data, error } = await supabase.from('prompts').select('*').eq('id', id).single();
        if (error || !data) { navigate('/dashboard'); } else {
          setFormData({
            title: data.title,
            body: data.body,
            description: data.description || '',
            categories: data.categories,
            is_public: data.is_public
          });
        }
        setFetching(false);
      };
      fetchPrompt();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!user) return;

    const payload = {
      user_id: user.id,
      title: formData.title,
      body: formData.body,
      description: formData.description,
      categories: formData.categories,
      is_public: formData.is_public
    };

    const res = id 
      ? await supabase.from('prompts').update(payload).eq('id', id)
      : await supabase.from('prompts').insert(payload);

    if (!res.error) {
      navigate('/dashboard');
    } else {
      alert('Error saving prompt');
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading...</div>;

  return (
    <ModalOverlay title={id ? 'Edit Prompt' : 'New Prompt'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <TextArea
          label="Prompt Body"
          value={formData.body}
          onChange={e => setFormData({ ...formData, body: e.target.value })}
          rows={6}
          required
          className="font-mono"
        />
        <TextArea
          label="Context / Tips"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Categories</label>
          <CategoryChips
            selectedCategories={formData.categories}
            onChange={cats => setFormData({ ...formData, categories: cats })}
          />
        </div>
        <div className="flex items-center space-x-3 rounded-xl border border-slate-700 bg-surfaceHighlight p-4">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.is_public}
            onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
            className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-primary"
          />
          <label htmlFor="isPublic" className="cursor-pointer text-sm font-medium text-slate-200">
            Make this prompt public
          </label>
        </div>
        <Button type="submit" className="w-full" isLoading={loading}>
          Save Prompt
        </Button>
      </form>
    </ModalOverlay>
  );
};
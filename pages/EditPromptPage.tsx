import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Input, TextArea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CategoryChips } from '../components/ui/CategoryChips';

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
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          navigate('/dashboard'); // Handle error (not owner or not found)
        } else {
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

    let error;
    if (id) {
      const res = await supabase.from('prompts').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabase.from('prompts').insert(payload);
      error = res.error;
    }

    if (!error) {
      navigate('/dashboard');
    } else {
      console.error(error);
      alert('Error saving prompt');
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">
        {id ? 'Edit Prompt' : 'Create New Prompt'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-surface p-6 md:p-8">
          <div className="space-y-6">
            <Input
              label="Title"
              placeholder="e.g. Senior React Developer Persona"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <TextArea
              label="Prompt Body"
              placeholder="Paste the full prompt here..."
              value={formData.body}
              onChange={e => setFormData({ ...formData, body: e.target.value })}
              rows={8}
              required
              className="font-mono"
            />

            <TextArea
              label="Description / How to use (Optional)"
              placeholder="Explain when to use this prompt..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Categories</label>
              <CategoryChips
                selectedCategories={formData.categories}
                onChange={cats => setFormData({ ...formData, categories: cats })}
              />
            </div>

            <div className="flex items-center space-x-3 rounded-lg border border-slate-700 bg-surfaceHighlight p-4">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.is_public}
                onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
                className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-primary focus:ring-primary"
              />
              <label htmlFor="isPublic" className="cursor-pointer select-none text-sm font-medium text-slate-200">
                Make this prompt public
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Save Prompt
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
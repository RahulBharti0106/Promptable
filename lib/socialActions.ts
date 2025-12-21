import { supabase } from './supabaseClient';
import { Prompt } from '../types';

export const socialActions = {
  async toggleLike(promptId: string, userId: string, isLiked: boolean) {
    if (isLiked) {
      // Unlike
      const { error: likeError } = await supabase
        .from('prompt_likes')
        .delete()
        .match({ prompt_id: promptId, user_id: userId });
      
      if (likeError) throw likeError;

      // Update count (optimistic decrement handled in UI)
      await supabase.rpc('decrement_likes', { prompt_id: promptId });
    } else {
      // Like
      const { error: likeError } = await supabase
        .from('prompt_likes')
        .insert({ prompt_id: promptId, user_id: userId });
      
      if (likeError) throw likeError;

      await supabase.rpc('increment_likes', { prompt_id: promptId });
    }
  },

  async incrementCopyCount(promptId: string) {
    const { data } = await supabase.rpc('increment_copies', { prompt_id: promptId });
    // Note: If you haven't set up the RPC, you can just do a standard update:
    const { data: prompt } = await supabase.from('prompts').select('copies_count').eq('id', promptId).single();
    if (prompt) {
      await supabase.from('prompts').update({ copies_count: (prompt.copies_count || 0) + 1 }).eq('id', promptId);
    }
  },

  async remixPrompt(prompt: Prompt, userId: string) {
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        title: `${prompt.title} (Remix)`,
        body: prompt.body,
        description: `Remixed from @${prompt.profiles?.display_name || 'unknown'}. Original description: ${prompt.description}`,
        categories: prompt.categories,
        is_public: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment remix count on original
    await supabase.from('prompts')
      .update({ remixes_count: (prompt.remixes_count || 0) + 1 })
      .eq('id', prompt.id);

    return data;
  }
};
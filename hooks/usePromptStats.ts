import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePromptStats = (promptId: string, initialLikes = 0) => {
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch actual count from likes table
      const { count: likes } = await supabase
        .from('prompt_likes')
        .select('*', { count: 'exact', head: true })
        .eq('prompt_id', promptId);
      
      const { count: comments } = await supabase
        .from('prompt_comments')
        .select('*', { count: 'exact', head: true })
        .eq('prompt_id', promptId);

      if (likes !== null) setLikesCount(likes);
      if (comments !== null) setCommentsCount(comments);
    };

    fetchStats();

    // Subscribe to changes
    const likesChannel = supabase
      .channel(`stats-${promptId}`)
      .on('postgres_changes', { event: '*', table: 'prompt_likes', filter: `prompt_id=eq.${promptId}` }, fetchStats)
      .on('postgres_changes', { event: '*', table: 'prompt_comments', filter: `prompt_id=eq.${promptId}` }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
    };
  }, [promptId]);

  return { likesCount, commentsCount };
};
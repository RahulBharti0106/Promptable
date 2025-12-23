import { supabase } from './supabaseClient';

export const uploadAvatar = async (userId: string, file: File, onProgress?: (pct: number) => void) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `public/${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return publicUrl;
};
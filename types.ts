export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  body: string;
  description: string | null;
  categories: string[];
  is_public: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: Profile; 
}
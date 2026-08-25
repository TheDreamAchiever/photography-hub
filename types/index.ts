export type UserRole = 'viewer' | 'photographer' | 'admin';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  gear_list?: string[];
  role: UserRole;
  storage_quota_mb?: number;
  created_at?: string;
  photos_count?: number;
  followers_count?: number;
  following_count?: number;
}

export interface EXIFData {
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  software?: string;
  dateTime?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface AICritique {
  overallScore: number;
  summary: string;
  composition: {
    score: number;
    feedback: string;
  };
  lighting: {
    score: number;
    feedback: string;
  };
  colorGrading: {
    score: number;
    feedback: string;
  };
  technical: {
    score: number;
    feedback: string;
  };
  actionableTips: string[];
  recommendedAdjustments: {
    exposure?: string;
    highlights?: string;
    shadows?: string;
    temperature?: string;
    vibrance?: string;
    cropSuggestion?: string;
  };
}

export interface Photo {
  id: string;
  owner_id: string;
  album_id?: string | null;
  title: string;
  storage_path: string;
  thumbnail_path?: string;
  caption?: string;
  ai_tags?: string[];
  ai_description?: string;
  ai_critique?: AICritique;
  exif?: EXIFData;
  camera_make?: string;
  camera_model?: string;
  lens?: string;
  focal_length?: string;
  aperture?: string;
  shutter_speed?: string;
  iso?: number;
  width?: number;
  height?: number;
  color_palette?: string[];
  aspect_ratio?: string;
  category?: string;
  location?: string;
  is_public?: boolean;
  price?: number;
  views_count?: number;
  likes_count?: number;
  created_at?: string;
  profiles?: Profile;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface Album {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  visibility: 'public' | 'unlisted' | 'private';
  cover_photo_id?: string | null;
  cover_photo?: Photo;
  category?: string;
  order_index?: number;
  created_at?: string;
  photos_count?: number;
  profiles?: Profile;
  photos?: Photo[];
}

export interface Comment {
  id: string;
  photo_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  is_private: boolean;
  created_at: string;
  photos_count?: number;
  photos?: Photo[];
}

export interface SearchFilterState {
  query: string;
  category: string;
  color: string;
  orientation: string;
  camera: string;
  sortBy: 'trending' | 'recent' | 'likes' | 'price';
}

import { createClient } from "@/utils/supabase/client";
import { Photo, Profile, Album, Comment, AICritique } from "@/types";
import { DEMO_PHOTOS, DEMO_PROFILES, DEMO_ALBUMS, DEMO_COMMENTS } from "./mockData";

// Local in-memory / local-storage cache keys for persistence
const LOCAL_PHOTOS_KEY = "photography_hub_photos";
const LOCAL_ALBUMS_KEY = "photography_hub_albums";
const LOCAL_COMMENTS_KEY = "photography_hub_comments";
const LOCAL_LIKES_KEY = "photography_hub_likes";
const LOCAL_USER_KEY = "photography_hub_active_user";

export class DataService {
  private static getStored<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }

  // ACTIVE USER / AUTH HELPER
  static getActiveProfile(): Profile {
    return this.getStored<Profile>(LOCAL_USER_KEY, DEMO_PROFILES[0]);
  }

  static setActiveProfile(profile: Profile): void {
    this.setStored(LOCAL_USER_KEY, profile);
  }

  // PHOTOS
  static async getPhotos(options?: {
    category?: string;
    owner_id?: string;
    album_id?: string;
    searchQuery?: string;
    sortBy?: string;
  }): Promise<Photo[]> {
    const supabase = createClient();
    try {
      let query = supabase.from("photos").select("*, profiles(*)");
      
      if (options?.category && options.category !== "All") {
        query = query.eq("category", options.category);
      }
      if (options?.owner_id) {
        query = query.eq("owner_id", options.owner_id);
      }
      if (options?.album_id) {
        query = query.eq("album_id", options.album_id);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Photo[];
      }
    } catch (err) {
      console.warn("Supabase fetch fallback to local store:", err);
    }

    // Fallback to local combined with DEMO_PHOTOS
    const localPhotos = this.getStored<Photo[]>(LOCAL_PHOTOS_KEY, []);
    let all = [...localPhotos, ...DEMO_PHOTOS];
    
    // Deduplicate by ID
    const map = new Map<string, Photo>();
    all.forEach(p => map.set(p.id, p));
    let photos = Array.from(map.values());

    // Filter
    if (options?.category && options.category !== "All") {
      photos = photos.filter(p => p.category?.toLowerCase() === options.category?.toLowerCase() || p.ai_tags?.some(t => t.toLowerCase() === options.category?.toLowerCase()));
    }
    if (options?.owner_id) {
      photos = photos.filter(p => p.owner_id === options.owner_id || p.profiles?.username === options.owner_id);
    }
    if (options?.album_id) {
      photos = photos.filter(p => p.album_id === options.album_id);
    }
    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      photos = photos.filter(p => 
        p.title?.toLowerCase().includes(q) ||
        p.caption?.toLowerCase().includes(q) ||
        p.ai_tags?.some(t => t.toLowerCase().includes(q)) ||
        p.camera_model?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (options?.sortBy === "likes") {
      photos.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (options?.sortBy === "recent") {
      photos.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else {
      // Trending (views + likes weight)
      photos.sort((a, b) => ((b.views_count || 0) + (b.likes_count || 0) * 3) - ((a.views_count || 0) + (a.likes_count || 0) * 3));
    }

    return photos;
  }

  static async getPhotoById(id: string): Promise<Photo | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("photos").select("*, profiles(*)").eq("id", id).single();
      if (!error && data) return data as Photo;
    } catch {
      // Fallback
    }

    const all = await this.getPhotos();
    return all.find(p => p.id === id) || null;
  }

  static async savePhoto(photo: Partial<Photo>): Promise<Photo> {
    const activeUser = this.getActiveProfile();
    const newPhoto: Photo = {
      id: photo.id || `photo-${Date.now()}`,
      owner_id: activeUser.id,
      title: photo.title || "Untitled Capture",
      storage_path: photo.storage_path || "",
      thumbnail_path: photo.thumbnail_path || photo.storage_path,
      caption: photo.caption || "",
      ai_tags: photo.ai_tags || ["Photography"],
      ai_description: photo.ai_description || "",
      ai_critique: photo.ai_critique,
      exif: photo.exif,
      camera_make: photo.camera_make || photo.exif?.make,
      camera_model: photo.camera_model || photo.exif?.model || "Digital Camera",
      lens: photo.lens || photo.exif?.lens,
      focal_length: photo.focal_length || photo.exif?.focalLength,
      aperture: photo.aperture || photo.exif?.aperture,
      shutter_speed: photo.shutter_speed || photo.exif?.shutterSpeed,
      iso: photo.iso || photo.exif?.iso,
      width: photo.width || photo.exif?.dimensions?.width || 3840,
      height: photo.height || photo.exif?.dimensions?.height || 2160,
      color_palette: photo.color_palette || ["#09090b", "#71717a", "#ffffff"],
      category: photo.category || "Landscape",
      location: photo.location || "Earth",
      is_public: photo.is_public ?? true,
      price: photo.price || 0,
      views_count: 1,
      likes_count: 0,
      created_at: new Date().toISOString(),
      profiles: activeUser,
    };

    // Try Supabase insert
    const supabase = createClient();
    try {
      await supabase.from("photos").insert({
        id: newPhoto.id,
        owner_id: newPhoto.owner_id,
        title: newPhoto.title,
        storage_path: newPhoto.storage_path,
        thumbnail_path: newPhoto.thumbnail_path,
        caption: newPhoto.caption,
        ai_tags: newPhoto.ai_tags,
        ai_description: newPhoto.ai_description,
        camera_make: newPhoto.camera_make,
        camera_model: newPhoto.camera_model,
        lens: newPhoto.lens,
        focal_length: newPhoto.focal_length,
        aperture: newPhoto.aperture,
        shutter_speed: newPhoto.shutter_speed,
        iso: newPhoto.iso,
        category: newPhoto.category,
        is_public: newPhoto.is_public,
        price: newPhoto.price
      });
    } catch (e) {
      console.warn("Supabase insert photo error:", e);
    }

    // Save locally
    const local = this.getStored<Photo[]>(LOCAL_PHOTOS_KEY, []);
    this.setStored(LOCAL_PHOTOS_KEY, [newPhoto, ...local]);

    return newPhoto;
  }

  // LIKE TOGGLE
  static async toggleLike(photoId: string): Promise<{ isLiked: boolean; count: number }> {
    const active = this.getActiveProfile();
    const likes = this.getStored<Record<string, boolean>>(LOCAL_LIKES_KEY, {});
    const key = `${active.id}_${photoId}`;
    const currentlyLiked = !!likes[key];
    const newLiked = !currentlyLiked;

    likes[key] = newLiked;
    this.setStored(LOCAL_LIKES_KEY, likes);

    // Try Supabase
    const supabase = createClient();
    try {
      if (newLiked) {
        await supabase.from("likes").insert({ user_id: active.id, photo_id: photoId });
      } else {
        await supabase.from("likes").delete().match({ user_id: active.id, photo_id: photoId });
      }
    } catch {}

    const photo = await this.getPhotoById(photoId);
    const count = (photo?.likes_count || 0) + (newLiked ? 1 : (photo?.likes_count ? -1 : 0));
    return { isLiked: newLiked, count: Math.max(0, count) };
  }

  // COMMENTS
  static async getComments(photoId: string): Promise<Comment[]> {
    const supabase = createClient();
    try {
      const { data } = await supabase.from("comments").select("*, profile:profiles(*)").eq("photo_id", photoId);
      if (data && data.length > 0) return data as Comment[];
    } catch {}

    const localComments = this.getStored<Comment[]>(LOCAL_COMMENTS_KEY, []);
    const all = [...localComments, ...DEMO_COMMENTS];
    return all.filter(c => c.photo_id === photoId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  static async addComment(photoId: string, content: string): Promise<Comment> {
    const user = this.getActiveProfile();
    const comment: Comment = {
      id: `comm-${Date.now()}`,
      photo_id: photoId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
      profile: user,
    };

    const supabase = createClient();
    try {
      await supabase.from("comments").insert({
        id: comment.id,
        photo_id: photoId,
        user_id: user.id,
        content
      });
    } catch {}

    const localComments = this.getStored<Comment[]>(LOCAL_COMMENTS_KEY, []);
    this.setStored(LOCAL_COMMENTS_KEY, [...localComments, comment]);
    return comment;
  }

  // ALBUMS
  static async getAlbums(ownerId?: string): Promise<Album[]> {
    const supabase = createClient();
    try {
      let query = supabase.from("albums").select("*, profiles(*), cover_photo:photos(*)");
      if (ownerId) query = query.eq("owner_id", ownerId);
      const { data } = await query;
      if (data && data.length > 0) return data as Album[];
    } catch {}

    const localAlbums = this.getStored<Album[]>(LOCAL_ALBUMS_KEY, []);
    const all = [...localAlbums, ...DEMO_ALBUMS];
    if (ownerId) {
      return all.filter(a => a.owner_id === ownerId || a.profiles?.username === ownerId);
    }
    return all;
  }

  static async createAlbum(data: { title: string; description?: string; visibility: 'public' | 'unlisted' | 'private'; category?: string; cover_photo_id?: string }): Promise<Album> {
    const active = this.getActiveProfile();
    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      owner_id: active.id,
      title: data.title,
      description: data.description,
      visibility: data.visibility,
      cover_photo_id: data.cover_photo_id,
      category: data.category || "General",
      photos_count: 0,
      created_at: new Date().toISOString(),
      profiles: active,
    };

    const local = this.getStored<Album[]>(LOCAL_ALBUMS_KEY, []);
    this.setStored(LOCAL_ALBUMS_KEY, [newAlbum, ...local]);
    return newAlbum;
  }

  // PROFILES
  static async getProfileByUsername(username: string): Promise<Profile | null> {
    const cleanUser = username.replace(/^@/, "");
    const supabase = createClient();
    try {
      const { data } = await supabase.from("profiles").select("*").eq("username", cleanUser).single();
      if (data) return data as Profile;
    } catch {}

    return DEMO_PROFILES.find(p => p.username.toLowerCase() === cleanUser.toLowerCase()) || null;
  }
}

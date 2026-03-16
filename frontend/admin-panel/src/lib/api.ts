import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export const uploadAPI = {
  uploadImage: async (file: File, bucket: string = 'images', folder: string = '') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data: _uploadData, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(error.message || 'Failed to upload to storage');
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  deleteImage: async (url: string, bucket: string = 'images') => {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = url.includes('/') ? url.split(`${bucket}/`)[1] : fileName;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }
};

export const editionsAPI = {
  getAll: () => fetchAPI('/api/editions'),
  getById: (id: string) => fetchAPI(`/api/editions/${id}`),
  create: (data: any) => fetchAPI('/api/editions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/api/editions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/api/editions/${id}`, { method: 'DELETE' }),
};

export const speakersAPI = {
  getAll: (editionId?: string) => fetchAPI(`/api/speakers${editionId ? `?edition_id=${editionId}` : ''}`),
  getById: (id: string) => fetchAPI(`/api/speakers/${id}`),
  create: (data: any) => fetchAPI('/api/speakers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/api/speakers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/api/speakers/${id}`, { method: 'DELETE' }),
};

export const episodesAPI = {
  getAll: (editionId?: string) => fetchAPI(`/api/episodes${editionId ? `?edition_id=${editionId}` : ''}`),
  getById: (id: string) => fetchAPI(`/api/episodes/${id}`),
  create: (data: any) => fetchAPI('/api/episodes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/api/episodes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/api/episodes/${id}`, { method: 'DELETE' }),
};

export const reelsAPI = {
  getAll: (editionId?: string, episodeId?: string) => {
    let query = '';
    if (editionId && episodeId) {
      query = `?edition_id=${editionId}&episode_id=${episodeId}`;
    } else if (editionId) {
      query = `?edition_id=${editionId}`;
    } else if (episodeId) {
      query = `?episode_id=${episodeId}`;
    }
    return fetchAPI(`/api/reels${query}`);
  },
  getById: (id: string) => fetchAPI(`/api/reels/${id}`),
  create: (data: any) => fetchAPI('/api/reels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/api/reels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/api/reels/${id}`, { method: 'DELETE' }),
};

export const schedulesAPI = {
  getAll: (editionId?: string) => fetchAPI(`/api/schedules${editionId ? `?edition_id=${editionId}` : ''}`),
  getById: (id: string) => fetchAPI(`/api/schedules/${id}`),
  create: (data: any) => fetchAPI('/api/schedules', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/api/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/api/schedules/${id}`, { method: 'DELETE' }),
};

export const scheduleTasksAPI = {
  getAll: (scheduleId?: string) => fetchAPI(`/api/schedule-tasks${scheduleId ? `?schedule_id=${scheduleId}` : ''}`),
  getById: (id: string) => fetchAPI(`/api/schedule-tasks/${id}`),
  create: (data: any) => fetchAPI('/api/schedule-tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/api/schedule-tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/api/schedule-tasks/${id}`, { method: 'DELETE' }),
};

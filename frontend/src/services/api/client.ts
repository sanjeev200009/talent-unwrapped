import { API_CONFIG, getApiUrl } from "./config";
import type { Episode, EpisodeSpeaker, Speaker } from "../../types";

/**
 * DB Edition type from Supabase
 */
export interface DbEdition {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'draft' | 'live' | 'archived';
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

/**
 * DB Episode type from Supabase (with edition joined)
 */
export interface DbEpisodeRaw {
  id: string;
  edition_id: string;
  title: string;
  description?: string;
  youtube_url?: string;
  duration?: string;
  added_date?: string;
  thumbnail_url?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * DB Episode with speakers joined (from API)
 */
export interface DbEpisode extends Omit<DbEpisodeRaw, 'edition_id'> {
  edition?: DbEdition;
  speakers: DbSpeaker[];
}

/**
 * DB Speaker type
 */
export interface DbSpeaker {
  id: string;
  edition_id: string;
  name: string;
  role?: string;
  linkedin?: string;
  country?: string;
  location?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  questions?: string[];
}

/**
 * Transform DB Episode to frontend Episode type
 */
function transformDbEpisodeToEpisode(dbEpisode: DbEpisode, editions?: DbEdition[]): Episode {
  let editionName = 'Unknown';
  let editionLocation = 'Unknown';
  
  if (dbEpisode.edition) {
    editionName = dbEpisode.edition.name || editionName;
    editionLocation = dbEpisode.edition.location || editionName;
  } else if (editions && dbEpisode.edition_id) {
    const matchedEdition = editions.find(e => e.id === dbEpisode.edition_id);
    editionName = matchedEdition?.name || matchedEdition?.location || 'Unknown';
    editionLocation = matchedEdition?.location || editionName;
  }
  
  const speakers: EpisodeSpeaker[] = (dbEpisode.speakers || []).map((speaker) => ({
    name: speaker.name,
    role: speaker.role,
    avatar: speaker.photo_url || '',
    linkedinUrl: speaker.linkedin,
    questions: speaker.questions || [],
  }));

  let images: string[] = [];
  if (dbEpisode.images) {
    if (Array.isArray(dbEpisode.images)) {
      images = dbEpisode.images;
    } else if (typeof dbEpisode.images === 'string') {
      try {
        images = JSON.parse(dbEpisode.images);
      } catch {
        images = [];
      }
    }
  }
  
  return {
    id: dbEpisode.id,
    title: dbEpisode.title,
    description: dbEpisode.description,
    image: dbEpisode.thumbnail_url || '',
    videoUrl: dbEpisode.youtube_url || '',
    duration: dbEpisode.duration,
    date: dbEpisode.added_date ? formatDate(dbEpisode.added_date) : '',
    speakers,
    edition: editionName,
    editionLocation: editionLocation,
    featured: false,
    category: 'EPISODE',
    images,
  };
}

/**
 * Format date string to "Dec 10, 2025" format
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Fetch all live editions from the database
 */
export async function fetchEditions(): Promise<DbEdition[]> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.EDITIONS));
    if (!response.ok) {
      throw new Error(`Failed to fetch editions: ${response.statusText}`);
    }
    const editions: DbEdition[] = await response.json();
    return editions.filter(e => e.status === 'live');
  } catch (error) {
    console.error('Error fetching editions:', error);
    return [];
  }
}

/**
 * Fetch a single edition by ID
 */
export async function fetchEditionById(id: string): Promise<DbEdition | null> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.EDITION_DETAIL(id)));
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching edition:', error);
    return null;
  }
}

/**
 * Fetch all episodes from the database
 */
export async function fetchEpisodes(): Promise<DbEpisode[]> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.EPISODES));
    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
}

/**
 * Fetch episodes for a specific edition
 */
export async function fetchEpisodesByEdition(editionId: string): Promise<DbEpisode[]> {
  try {
    const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.EPISODES)}?edition_id=${editionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching episodes by edition:', error);
    return [];
  }
}

/**
 * Fetch a single episode by ID
 */
export async function fetchEpisodeById(id: string): Promise<Episode | null> {
  try {
    const [response, editions] = await Promise.all([
      fetch(getApiUrl(API_CONFIG.ENDPOINTS.EPISODE_DETAIL(id))),
      fetchEditions()
    ]);
    if (!response.ok) {
      return null;
    }
    const dbEpisode: DbEpisode = await response.json();
    return transformDbEpisodeToEpisode(dbEpisode, editions);
  } catch (error) {
    console.error('Error fetching episode:', error);
    return null;
  }
}

/**
 * Fetch all DB episodes transformed to frontend Episode type
 */
export async function fetchDbEpisodes(): Promise<Episode[]> {
  const [dbEpisodes, editions] = await Promise.all([
    fetchEpisodes(),
    fetchEditions()
  ]);
  return dbEpisodes.map(ep => transformDbEpisodeToEpisode(ep, editions));
}

/**
 * Fetch DB episodes for a specific edition (by edition name or ID)
 */
export async function fetchDbEpisodesByEdition(editionName: string): Promise<Episode[]> {
  const editions = await fetchEditions();
  const edition = editions.find(e => 
    e.name.toLowerCase().includes(editionName.toLowerCase()) ||
    e.location.toLowerCase().includes(editionName.toLowerCase())
  );
  
  if (!edition) {
    return [];
  }
  
  const dbEpisodes = await fetchEpisodesByEdition(edition.id);
  return dbEpisodes.map(ep => transformDbEpisodeToEpisode(ep, editions));
}

/**
 * DB Reel type from Supabase
 */
export interface DbReel {
  id: string;
  edition_id: string;
  episode_id?: string;
  title: string;
  description?: string;
  views?: string;
  thumbnail_url?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Transform DB Reel to frontend Reel type
 */
export function transformDbReelToReel(dbReel: DbReel) {
  return {
    id: dbReel.id,
    title: dbReel.title,
    description: dbReel.description,
    thumbnailUrl: dbReel.thumbnail_url || '',
    videoUrl: dbReel.url || '',
    edition: dbReel.edition_id,
    views: dbReel.views,
  };
}

/**
 * Fetch all reels from database
 */
export async function fetchReels(): Promise<DbReel[]> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REELS));
    if (!response.ok) {
      throw new Error(`Failed to fetch reels: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reels:', error);
    return [];
  }
}

/**
 * Fetch reels by episode ID
 */
export async function fetchReelsByEpisode(episodeId: string): Promise<DbReel[]> {
  try {
    const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.REELS)}?episode_id=${episodeId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reels: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reels by episode:', error);
    return [];
  }
}

/**
 * DB Schedule type from Supabase
 */
export interface DbSchedule {
  id: string;
  edition_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

/**
 * DB Schedule Task type from Supabase
 */
export interface DbScheduleTask {
  id: string;
  schedule_id: string;
  title: string;
  description?: string;
  task_date?: string;
  task_time?: string;
  created_at: string;
}

/**
 * Fetch schedule by edition ID
 */
export async function fetchScheduleByEdition(editionId: string): Promise<DbSchedule | null> {
  try {
    const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULES)}?edition_id=${editionId}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return null;
  }
}

/**
 * Fetch schedule tasks by schedule ID
 */
export async function fetchScheduleTasks(scheduleId: string): Promise<DbScheduleTask[]> {
  try {
    const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULE_TASKS)}?schedule_id=${scheduleId}`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching schedule tasks:', error);
    return [];
  }
}

/**
 * Fetch schedule and tasks by edition ID
 */
export async function fetchScheduleWithTasks(editionId: string): Promise<{ schedule: DbSchedule | null; tasks: DbScheduleTask[] }> {
  const schedule = await fetchScheduleByEdition(editionId);
  if (!schedule) {
    return { schedule: null, tasks: [] };
  }
  const tasks = await fetchScheduleTasks(schedule.id);
  return { schedule, tasks };
}

/**
 * Transform DB Speaker to frontend Speaker type
 */
export function transformDbSpeakerToSpeaker(dbSpeaker: DbSpeaker): Speaker {
  return {
    id: parseInt(dbSpeaker.id.replace(/\D/g, '')) || Math.random() * 10000,
    name: dbSpeaker.name,
    title: dbSpeaker.role || '',
    views: dbSpeaker.location || dbSpeaker.country || '',
    position: dbSpeaker.role || '',
    image: dbSpeaker.photo_url || '',
    linkedinUrl: dbSpeaker.linkedin,
    edition: undefined,
  };
}

/**
 * Fetch speakers by edition ID
 */
export async function fetchSpeakersByEdition(editionId: string): Promise<Speaker[]> {
  try {
    const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SPEAKERS)}?edition_id=${editionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch speakers: ${response.statusText}`);
    }
    const dbSpeakers: DbSpeaker[] = await response.json();
    return dbSpeakers.map(transformDbSpeakerToSpeaker);
  } catch (error) {
    console.error('Error fetching speakers by edition:', error);
    return [];
  }
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public data: any,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Request interceptor type
 */
export type RequestInterceptor = (
  config: RequestInit,
) => RequestInit | Promise<RequestInit>;

/**
 * Response interceptor type
 */
export type ResponseInterceptor = (
  response: Response,
) => Response | Promise<Response>;

/**
 * Error interceptor type
 */
export type ErrorInterceptor = (error: Error) => Error | Promise<Error>;

/**
 * HTTP Client with interceptor support and error handling
 */
export class HttpClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Execute request interceptors
   */
  private async executeRequestInterceptors(
    config: RequestInit,
  ): Promise<RequestInit> {
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  /**
   * Execute response interceptors
   */
  private async executeResponseInterceptors(
    response: Response,
  ): Promise<Response> {
    let finalResponse = response;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  /**
   * Execute error interceptors
   */
  private async executeErrorInterceptors(error: Error): Promise<Error> {
    let finalError = error;
    for (const interceptor of this.errorInterceptors) {
      finalError = await interceptor(finalError);
    }
    return finalError;
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryRequest(
    url: string,
    config: RequestInit,
    attempt: number = 0,
  ): Promise<Response> {
    try {
      return await fetch(url, config);
    } catch (error) {
      const shouldRetry =
        attempt < API_CONFIG.RETRY.MAX_ATTEMPTS &&
        (error instanceof TypeError || error instanceof Error);

      if (shouldRetry) {
        const delay =
          API_CONFIG.RETRY.DELAY *
          Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(url, config, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = getApiUrl(endpoint);
    const config: RequestInit = {
      method: "GET",
      ...options,
    };

    return this.request<T>(url, config);
  }

  /**
   * Generic POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const config: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    };

    return this.request<T>(url, config);
  }

  /**
   * Generic PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
  ): Promise<T> {
    const url = getApiUrl(endpoint);
    const config: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    };

    return this.request<T>(url, config);
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = getApiUrl(endpoint);
    const config: RequestInit = {
      method: "DELETE",
      ...options,
    };

    return this.request<T>(url, config);
  }

  /**
   * Core request method with interceptor and error handling
   */
  private async request<T>(url: string, config: RequestInit): Promise<T> {
    try {
      // Execute request interceptors
      const finalConfig = await this.executeRequestInterceptors(config);

      // Make request with retry logic
      let response = await this.retryRequest(url, finalConfig);

      // Execute response interceptors
      response = await this.executeResponseInterceptors(response);

      // Check if response is OK
      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        const error = new ApiError(
          response.status,
          errorData,
          `HTTP ${response.status}: ${response.statusText}`,
        );

        throw error;
      }

      // Parse and return response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Execute error interceptors
      const finalError =
        error instanceof Error
          ? await this.executeErrorInterceptors(error)
          : error;
      throw finalError;
    }
  }
}

/**
 * Create a singleton HTTP client instance
 */
export const apiClient = new HttpClient();

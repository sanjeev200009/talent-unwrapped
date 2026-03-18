/**
 * API Module exports
 * Centralized exports for API client and configuration
 */

export { apiClient, ApiError, HttpClient } from "./client";
export type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from "./client";
export { API_CONFIG, getApiUrl } from "./config";
export type {
  DbEdition,
  DbEpisode,
  DbEpisodeRaw,
  DbSpeaker,
  DbReel,
  DbSchedule,
  DbScheduleTask,
} from "./client";
export {
  fetchEditions,
  fetchEditionById,
  fetchEpisodes,
  fetchEpisodesByEdition,
  fetchEpisodeById,
  fetchDbEpisodes,
  fetchDbEpisodesByEdition,
  fetchReels,
  fetchReelsByEpisode,
  fetchScheduleByEdition,
  fetchScheduleTasks,
  fetchScheduleWithTasks,
  fetchSpeakersByEdition,
  transformDbReelToReel,
  transformDbSpeakerToSpeaker,
} from "./client";

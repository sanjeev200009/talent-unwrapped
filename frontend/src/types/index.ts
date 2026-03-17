// Shared TypeScript types
import { DbSchedule, DbScheduleTask } from "../services/api/client";
import type { EditionType } from './edition';

export interface Podcast {
  id: number;
  title: string;
  edition: string;
  date: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface Speaker {
  id: number;
  title: string;
  views: string;
  name: string;
  position: string;
  image: string;
  linkedinUrl?: string;
  edition?: string;
}

// Episode interface with all possible properties
export interface Episode {
  id: number | string;
  title: string;
  subtitle?: string;
  icon?: string;
  videoIcon?: string;
  exportIcon?: string;
  image?: string;
  category?: string;
  description?: string;
  duration?: string;
  date?: string;
  speakers?: EpisodeSpeaker[];
  featured?: boolean;
  videoUrl?: string;
  edition?: string;
  images?: string[];
}

// Speaker interface used in episodes with minimal properties
export interface EpisodeSpeaker {
  name: string;
  role?: string;
  avatar: string;
  linkedinUrl?: string;
  questions?: string[];
}

// Video slide interface for full episode pages
export interface VideoSlide {
  id: number;
  thumbnail: string;
  title: string;
  edition?: string;
  videoUrl?: string;
}

// Props for TheThreeChaptersSection component
export interface TheThreeChaptersSectionProps {
  edition?: EditionType;
  hideTopSection?: boolean;
  schedule?: DbSchedule | null;
  scheduleTasks?: DbScheduleTask[];
  dbEditionId?: string;
  dbEditionName?: string;
}

// Contact form data
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  designation: string;
}

// Re-export EditionType for convenience
export { type EditionType } from './edition';

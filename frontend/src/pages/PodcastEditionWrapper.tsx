import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PodcastEditionPage } from "./PodcastEditionPage";
import { useEpisodeEdition } from "../hooks/useEpisodeEdition";
import { fetchEditions, fetchDbEpisodesByEdition, fetchScheduleWithTasks, DbEdition, DbSchedule, DbScheduleTask } from "../services/api/client";
import type { EditionType, Episode } from "../types";

/**
 * Create slug from edition name
 */
const createEditionSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+edition\s*/gi, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

/**
 * PodcastEditionWrapper
 *
 * This is a "smart" wrapper that sits between the router and the actual
 * PodcastEditionPage. It handles two things:
 *
 *   1. Validates the :edition URL param — allows "singapore", "dubai", "sri-lanka"
 *      and any DB edition slug. Invalid editions redirect to /edition/singapore.
 *
 *   2. Loads the episode list for the current edition using the
 *      `useEpisodeEdition` hook, which caches the data so switching
 *      editions is instant (no flash, no refetch).
 *
 * Why a wrapper instead of doing this in PodcastEditionPage directly?
 * Because it lets the page component stay simple and "dumb" — it just
 * receives data as props and renders it.
 */
export const PodcastEditionWrapper = (): JSX.Element | null => {
  const { edition } = useParams<{ edition: string }>();
  const navigate = useNavigate();
  const [dbEdition, setDbEdition] = useState<DbEdition | null>(null);
  const [dbEpisodes, setDbEpisodes] = useState<Episode[]>([]);
  const [dbSchedule, setDbSchedule] = useState<DbSchedule | null>(null);
  const [dbScheduleTasks, setDbScheduleTasks] = useState<DbScheduleTask[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  const hardcodedEditions = ['singapore', 'dubai', 'sri-lanka'];
  const isHardcoded = hardcodedEditions.includes(edition || '');

  // Check if it's a DB edition and fetch its data
  useEffect(() => {
    if (!edition || isHardcoded) return;

    const loadDbEdition = async () => {
      setLoadingDb(true);
      try {
        const editions = await fetchEditions();
        const matchedEdition = editions.find(e => 
          createEditionSlug(e.name) === edition
        );
        if (matchedEdition) {
          setDbEdition(matchedEdition);
          const episodes = await fetchDbEpisodesByEdition(matchedEdition.name);
          setDbEpisodes(episodes);
          
          // Fetch schedule and tasks for this edition
          const { schedule, tasks } = await fetchScheduleWithTasks(matchedEdition.id);
          setDbSchedule(schedule);
          setDbScheduleTasks(tasks);
        }
      } catch (error) {
        console.error('Failed to load DB edition:', error);
      } finally {
        setLoadingDb(false);
      }
    };

    loadDbEdition();
  }, [edition, isHardcoded]);

  // Validate edition is one of the allowed values or is a DB edition
  const validEdition = useMemo(() => {
    if (!edition) return null;
    
    if (isHardcoded) {
      return edition as EditionType;
    }
    
    // For DB editions, return a custom slug
    if (dbEdition) {
      return edition as EditionType;
    }
    
    return null;
  }, [edition, isHardcoded, dbEdition]);

  // Redirect to singapore if invalid edition (after loading completes and with a small delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loadingDb && !isHardcoded && !dbEdition && edition) {
        navigate("/edition/singapore", { replace: true });
      }
    }, 500); // Small delay to allow edition fetch to complete
    
    return () => clearTimeout(timer);
  }, [loadingDb, isHardcoded, dbEdition, edition, navigate]);

  // Load data for current edition (hook handles caching internally)
  const { episodes: hardcodedEpisodes, handleViewEpisode } = useEpisodeEdition(
    isHardcoded ? (validEdition || "singapore") : "singapore"
  );

  // Use DB episodes if this is a DB edition, otherwise use hardcoded
  const episodes = isHardcoded ? hardcodedEpisodes : dbEpisodes;

  // Smooth scroll to top when edition changes
  useEffect(() => {
    if (validEdition) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [validEdition]);

  // Prevent flash by not rendering until edition is validated
  if (!validEdition || (!isHardcoded && loadingDb)) {
    return null;
  }

  // Parse edition images from dbEdition
  const getEditionImages = () => {
    if (!dbEdition?.image_url) return [];
    try {
      const parsed = JSON.parse(dbEdition.image_url);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return dbEdition.image_url ? [dbEdition.image_url] : [];
    }
  };

  const editionImages = isHardcoded ? [] : getEditionImages();
  const editionName = isHardcoded ? null : dbEdition?.name;
  const editionLocation = isHardcoded ? null : dbEdition?.location;
  const editionDescription = isHardcoded ? null : (dbEdition?.internal_notes || null);

  return (
    <PodcastEditionPage
      edition={validEdition}
      episodes={episodes}
      onViewEpisode={handleViewEpisode}
      schedule={isHardcoded ? null : dbSchedule}
      scheduleTasks={isHardcoded ? [] : dbScheduleTasks}
      editionImages={editionImages}
      dbEditionName={editionName || undefined}
      dbEditionLocation={editionLocation || undefined}
      dbEditionDescription={editionDescription || undefined}
    />
  );
};

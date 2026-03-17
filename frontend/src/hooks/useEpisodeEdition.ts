import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Episode, EditionType } from "../types";
import { getEpisodesByEdition, getEpisodesByEditionMixed, getAllEpisodesMerged } from "../data";


interface UseEpisodeEditionReturn {
  episodes: Episode[];
  editionName: string;
  handleViewEpisode: (episodeId: string | number) => void;
  loading: boolean;
}

/**
 * Hook for managing episode data and navigation for a specific podcast edition
 * Encapsulates business logic for episode loading and navigation
 *
 * Features:
 * - Fetches both hardcoded and DB episodes
 * - Memoizes episodes to prevent unnecessary recalculations
 * - Memoizes edition name formatting
 * - Only recalculates when edition changes
 */
export const useEpisodeEdition = (
  edition: EditionType,
): UseEpisodeEditionReturn => {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEpisodes = async () => {
      setLoading(true);
      try {
        const allEpisodes = await getAllEpisodesMerged();
        const filtered = allEpisodes.filter(ep => {
          const editionLower = edition.toLowerCase();
          const epEdition = ep.edition?.toLowerCase() || "";
          return epEdition === editionLower || 
                 (editionLower === "sri-lanka" && (epEdition === "sri lanka" || epEdition === "colombo"));
        });
        setEpisodes(filtered);
      } catch (error) {
        console.error("Failed to load episodes:", error);
        setEpisodes(getEpisodesByEdition(edition));
      } finally {
        setLoading(false);
      }
    };

    loadEpisodes();
  }, [edition]);

  // Memoize edition name formatting
  const editionName = useMemo(() => {
    return edition.charAt(0).toUpperCase() + edition.slice(1);
  }, [edition]);

  // Handle episode navigation with edition context
  const handleViewEpisode = (episodeId: string | number) => {
    navigate(`/episode/${episodeId}`, {
      state: { edition: editionName },
    });
  };

  return {
    episodes,
    editionName,
    handleViewEpisode,
    loading,
  };
};

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FooterSection,
  GlobalHeader,
  AboutUsSection,
  SubmitFormSection,
} from "../components";
import { EpisodeCard } from "../features/podcasts";
import { EPISODES, getEpisodesByEdition, getAllEpisodesMerged, getEpisodesByEditionMixed } from "../data/episodes";
import { TalentIntroductionSection } from "../features/landing";
import { SECTION_TITLES, NAV_LABELS, EDITION_NAMES, FEEDBACK_MESSAGES } from "@/constants/copy";
import type { Episode } from "../types";
import { fetchEditions, DbEdition } from "../services/api/client";

const createEditionSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+edition\s*/gi, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

/**
 * EpisodesPage
 *
 * Shows a full list of all podcast episodes with a filter bar at the top.
 * Users can filter by edition: All, Dubai, Singapore, or Sri Lanka.
 *
 * The episode data comes from `src/data/episodes.ts`.
 * Each card uses the `EpisodeCard` component from `src/features/podcasts/`.
 * Clicking a card navigates to `/episode/:episodeId` (FullEpisodePage).
 */
export const EpisodesPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbEditions, setDbEditions] = useState<DbEdition[]>([]);

  useEffect(() => {
    document.title = "Talent Unwrapped - All Episodes";
    loadEditions();
    loadEpisodes();
  }, []);

  useEffect(() => {
    loadEpisodes();
  }, [filter, dbEditions]);

  const loadEditions = async () => {
    try {
      const editions = await fetchEditions();
      setDbEditions(editions.filter(e => e.status === 'live'));
    } catch (error) {
      console.error("Failed to load editions:", error);
    }
  };

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      // Fetch editions to check their status - always fetch fresh for filtering
      const allEditions = await fetchEditions();
      const liveDbEditions = allEditions.filter(e => e.status === 'live');
      const liveEditionNames = new Set(
        liveDbEditions
          .map(e => e.name.toLowerCase())
      );
      
      const allEpisodes = await getAllEpisodesMerged();
      
      // Filter episodes: keep hardcoded ones, filter DB ones by edition status
      const filtered = allEpisodes.filter(ep => {
        // Keep all hardcoded episodes
        const editionLower = ep.edition?.toLowerCase() || "";
        const isHardcoded = editionLower === "dubai" || editionLower === "singapore" || 
                          editionLower === "sri lanka" || editionLower === "sri-lanka" || editionLower === "colombo";
        
        if (isHardcoded) return true;
        
        // For DB episodes, check if the edition is live
        if (liveEditionNames.size === 0) {
          return false;
        }
        
        return liveEditionNames.has(editionLower);
      });
      
      // Apply edition filter
      const byEdition = filter === "all" 
        ? filtered 
        : filtered.filter(ep => {
            const edition = ep.edition?.toLowerCase() || "";
            if (filter === "dubai") return edition === "dubai";
            if (filter === "singapore") return edition === "singapore";
            if (filter === "sri-lanka") return edition === "sri lanka" || edition === "colombo";
            // Check if it's a DB edition - compare slugs
            return createEditionSlug(ep.edition || '') === filter;
          });
      setEpisodes(byEdition);
    } catch (error) {
      console.error("Failed to load episodes:", error);
      setEpisodes(EPISODES);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEpisode = (episodeId: string | number) => {
    const episode = episodes.find(ep => ep.id === String(episodeId)) || EPISODES.find(ep => ep.id === String(episodeId));
    let editionName = EDITION_NAMES.DUBAI;

    if (episode?.edition === "Singapore") {
      editionName = EDITION_NAMES.SINGAPORE;
    } else if (episode?.edition === "Sri Lanka") {
      editionName = EDITION_NAMES.SRI_LANKA;
    }

    navigate(`/episode/${episodeId}`, {
      state: { edition: editionName }
    });
  };

  return (
    <>
      <main className="flex flex-col items-center relative bg-white w-full overflow-x-clip">
        <div className="w-full">
          <GlobalHeader />
        </div>

        {/* Hero Content Section */}
        <div className="w-full overflow-x-clip">
          <TalentIntroductionSection />
        </div>

        <section
          id="episodes"
          className="w-full bg-white py-16 sm:py-20 md:py-24 lg:py-[90px]"
          aria-label="All Episodes Listing"
        >
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
            <div className="w-full">
              {/* Section Title */}
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 sm:mb-10 lg:mb-[40px] gap-6 md:gap-0">
                <h1 className="[font-family:'Geist',Helvetica] font-medium text-3xl sm:text-4xl md:text-5xl lg:text-[52px] tracking-[0] leading-tight lg:leading-[70px]">
                  <span className="text-[#232323]">{SECTION_TITLES.ALL_EPISODES.split(" ")[0]} </span>
                  <span className="text-[#7bb302]">{SECTION_TITLES.ALL_EPISODES.split(" ")[1]}</span>
                </h1>

                {/* Filter Controls */}
                <div className="flex items-center gap-2 sm:gap-4 bg-gray-50 p-1 rounded-full border border-gray-100 overflow-x-auto scrollbar-hide max-w-[calc(100vw-32px)] sm:max-w-full">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${filter === "all"
                      ? "bg-white text-[#7bb302] shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {NAV_LABELS.ALL}
                  </button>
                  <button
                    onClick={() => setFilter("dubai")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${filter === "dubai"
                      ? "bg-white text-[#ed2939] shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {EDITION_NAMES.DUBAI}
                  </button>
                  <button
                    onClick={() => setFilter("singapore")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${filter === "singapore"
                      ? "bg-white text-[#7cb403] shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {EDITION_NAMES.SINGAPORE}
                  </button>
                  <button
                    onClick={() => setFilter("sri-lanka")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${filter === "sri-lanka"
                      ? "bg-white text-[#7bb302] shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {EDITION_NAMES.SRI_LANKA}
                  </button>
                  {/* DB Edition Filters */}
                  {dbEditions.map((edition) => {
                    const slug = createEditionSlug(edition.name);
                    return (
                      <button
                        key={edition.id}
                        onClick={() => setFilter(slug)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${filter === slug
                          ? "bg-white text-[#7bb302] shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                          }`}
                      >
                        {edition.location || edition.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Episodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8 lg:gap-[40px]">
                {loading ? (
                  <div className="col-span-full py-20 text-center text-gray-500">
                    Loading episodes...
                  </div>
                ) : (
                  episodes.map((episode) => (
                    <EpisodeCard
                      key={episode.id}
                      episode={episode}
                      onViewEpisode={handleViewEpisode}
                    />
                  ))
                )}
              </div>

              {!loading && episodes.length === 0 && (
                <div className="w-full py-20 text-center">
                  {FEEDBACK_MESSAGES.NO_EPISODES_FOUND}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer Sections */}
        <SubmitFormSection />
        <AboutUsSection />
        <FooterSection />
      </main>
    </>
  );
};

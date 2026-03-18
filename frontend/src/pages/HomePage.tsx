import { useEffect, useState } from "react";
import {
  FooterSection,
  GlobalHeader,
  AboutUsSection,
  SubmitFormSection,
} from "../components";
import {
  EpisodeDetailsSection,
  HeroBannerSection,
  LatestPodcastListSection,
  SpeakersProfileSection,
  TalentIntroductionSection,
  WisdomAndTestimonialsSection,
  ReelsSection,
} from "../features/landing";
import SEO from "../components/common/SEO";
import { fetchEditions, fetchSpeakersByEdition, fetchEpisodes, getApiUrl, API_CONFIG, transformDbReelToReel, DbEdition, Speaker } from "../services/api";

/**
 * HomePage
 *
 * This is the first thing users see when they visit the site.
 * It stacks all the landing sections from `src/features/landing/` in order:
 *   1. Hero banner
 *   2. Wisdom & Testimonials
 *   3. Talent Introduction
 *   4. Latest Podcasts
 *   5. Speaker Profiles (full-width breakout)
 *   6. Reels
 *   7. Episode Details
 *   8. Footer (Submit Form → Contact Us → Footer)
 *
 * Note: All sections are full-width (`overflow-x-clip`) to prevent horizontal scroll.
 */
export const HomePage = (): JSX.Element => {
  const [dbEditions, setDbEditions] = useState<DbEdition[]>([]);
  const [dbSpeakersMap, setDbSpeakersMap] = useState<Map<string, Speaker[]>>(new Map());
  const [dbReelsMap, setDbReelsMap] = useState<any[]>([]);
  const [dbEpisodeImages, setDbEpisodeImages] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const loadDbData = async () => {
      const editions = await fetchEditions();
      setDbEditions(editions);

      const speakersMap = new Map<string, Speaker[]>();
      for (const edition of editions) {
        const speakers = await fetchSpeakersByEdition(edition.id);
        speakersMap.set(edition.name, speakers);
      }
      setDbSpeakersMap(speakersMap);
      
      // Fetch all DB reels
      try {
        const reelsResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REELS));
        if (reelsResponse.ok) {
          const allDbReels = await reelsResponse.json();
          setDbReelsMap(allDbReels.map(transformDbReelToReel));
        }
      } catch (error) {
        console.error('Error fetching reels:', error);
      }

      // Fetch all episode images from DB
      try {
        const episodesResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.EPISODES));
        if (episodesResponse.ok) {
          const allDbEpisodes = await episodesResponse.json();
          const images: string[] = [];
          allDbEpisodes.forEach((ep: any) => {
            // Parse images field only
            if (ep.images) {
              if (Array.isArray(ep.images)) {
                images.push(...ep.images);
              } else if (typeof ep.images === 'string') {
                try {
                  const parsed = JSON.parse(ep.images);
                  if (Array.isArray(parsed)) {
                    images.push(...parsed);
                  }
                } catch {}
              }
            }
          });
          setDbEpisodeImages(images);
        }
      } catch (error) {
        console.error('Error fetching episode images:', error);
      }
    };

    loadDbData();
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const getFilteredSpeakers = (): Speaker[] | undefined => {
    if (activeFilter === "All") return undefined;
    
    const dbEdition = dbEditions.find(e => {
      // Match by name, slug, or location
      const nameMatch = e.name.toLowerCase() === activeFilter.toLowerCase();
      const locationMatch = e.location && e.location.toLowerCase() === activeFilter.toLowerCase();
      return nameMatch || locationMatch;
    });
    if (dbEdition) {
      return dbSpeakersMap.get(dbEdition.name);
    }
    return undefined;
  };

  const specificSpeakers = getFilteredSpeakers();

  const podcastSeriesSchema = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "name": "Talent Unwrapped",
    "description":
      "A podcast series exploring the human dimensions of ambition, design, and leadership across Singapore, Dubai, and the GCC region.",
    "url": "https://talentunwrapped.com",
    "image":
      "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1771220347/Artboard_3_1_nbtue5.svg",
    "author": {
      "@type": "Organization",
      "name": "Career141",
      "url": "https://career141.com",
    },
    "genre": ["Business", "Leadership", "Career Development"],
    "inLanguage": "en",
  };

  return (
    <>
      <SEO
        title="Talent Unwrapped - Leadership & Innovation Podcast | Career141"
        description="Explore leadership, innovation, and the future of work through conversations with industry leaders across Singapore, Dubai, and the GCC. A Career141 podcast series."
        keywords="talent unwrapped podcast, leadership podcast, innovation podcast, future of work, GCC talent, Singapore business, Dubai leadership, career141"
        url="/"
        podcastSchema={podcastSeriesSchema}
      />
      <main className="flex flex-col items-center relative bg-white w-full">
        <div className="w-full">
          <GlobalHeader />
        </div>

        {/* Hero & About sections - now bypassing global layout */}
        <div className="w-full overflow-x-clip">
          <HeroBannerSection />
          <WisdomAndTestimonialsSection />
          <TalentIntroductionSection />
        </div>

        {/* Full-width latest podcast section */}
        <div className="w-full overflow-x-clip">
          <LatestPodcastListSection />
        </div>

        {/* Full-width speakers section - breaks out of global layout */}
        <div className="w-full overflow-x-clip">
          <SpeakersProfileSection 
            onFilterChange={handleFilterChange}
            activeFilter={activeFilter}
            dbSpeakersMap={dbSpeakersMap}
            dbEditions={dbEditions}
          />
        </div>

        {/* Full-width reels section */}
        <div className="w-full overflow-x-clip">
          <ReelsSection dbReels={dbReelsMap} />
        </div>

        {/* Full-width episode details section */}
        <div className="w-full overflow-x-clip">
          <EpisodeDetailsSection dbEpisodeImages={dbEpisodeImages} />
        </div>

        {/* Footer sections - now bypassing global layout */}
        <div className="w-full overflow-x-clip">
          <SubmitFormSection />
          <AboutUsSection />
          <FooterSection />
        </div>
      </main>
    </>
  );
};

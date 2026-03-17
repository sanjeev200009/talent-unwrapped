import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
import {
  ReelsSection,
  AboutUsSection,
  GlobalHeader,
  FooterSection,
  SubmitFormSection,
} from "../components";
import {
  SpeakersProfileSection,
  EpisodeDetailsSection,
  TalentIntroductionSection,
} from "../features/landing";
import { KeyQuestionsSection } from "../features/podcasts";
import {
  PlayCircleFilledIcon,
  PlayIcon,
} from "@/components/common/Icons";
import { HERO_CONTENT } from "@/constants/copy";
import { getVideoSlidesByEdition, getEpisodeById, getEpisodesByEdition, getEpisodeByIdMixed, getAllEpisodesMerged } from "@/data";
import { EpisodeSpeaker, Speaker, Episode } from "@/types";
import SEO from "../components/common/SEO";

/**
 * Helper to transform YouTube URLs into embed URLs
 */
const getEmbedUrl = (url: string, autoplay: boolean = true): string => {
  if (!url) return '';
  
  try {
    let videoId = '';
    
    // Already an embed URL - extract video ID
    if (url.includes("youtube.com/embed/")) {
      const match = url.match(/embed\/([^/?]+)/);
      videoId = match?.[1] || '';
    }
    // youtu.be short URLs
    else if (url.includes("youtu.be/")) {
      const match = url.match(/youtu\.be\/([^/?]+)/);
      videoId = match?.[1] || '';
    }
    // youtube.com/watch?v= URLs
    else if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || '';
    }
    // YouTube Shorts URLs (youtube.com/shorts/)
    else if (url.includes("youtube.com/shorts/")) {
      const match = url.match(/shorts\/([^/?]+)/);
      videoId = match?.[1] || '';
    }
    
    // If we have a valid video ID, return the embed URL
    if (videoId) {
      const autoplayParam = autoplay ? "1" : "0";
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3`;
    }
    
    // Return original URL if no known format
    return url;
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
    return url;
  }
};

/**
 * Helper to get YouTube thumbnail URL
 */
const getYoutubeThumbnail = (url: string) => {
  try {
    let videoId = "";
    if (url.includes("youtu.be")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || "";
    } else if (url.includes("youtube.com/embed")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  } catch (e) {
    return "";
  }
};

/**
 * Full Episode Page
 * Displays full episode details with video player, speakers, and related sections
 * Uses EpisodeLayout for consistent structure without repeating header/footer logic
 * Now uses unified ContactUsSection across all pages
 */
export const FullEpisodePage = (): JSX.Element => {
  const { episodeId } = useParams<{ episodeId: string }>();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [episode, setEpisode] = useState<Episode | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const loadEpisode = async () => {
      if (!episodeId) {
        setLoading(false);
        return;
      }
      
      try {
        const ep = await getEpisodeByIdMixed(episodeId);
        setEpisode(ep);
      } catch (error) {
        console.error("Failed to load episode:", error);
        setEpisode(getEpisodeById(episodeId));
      } finally {
        setLoading(false);
      }
    };

    loadEpisode();
  }, [episodeId]);

  // Stop video when section leaves viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsPlaying(false);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }
      },
      { threshold: 0 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle local video playback via ref
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Determine edition by checking lists - including DB episodes
  let detectedEdition = location.state?.edition;
  if (!detectedEdition && episode) {
    // First check hardcoded episodes
    if (getEpisodesByEdition("dubai").some((ep: Episode) => ep.id === episode.id)) detectedEdition = "Dubai";
    else if (getEpisodesByEdition("singapore").some((ep: Episode) => ep.id === episode.id)) detectedEdition = "Singapore";
    else if (getEpisodesByEdition("sri-lanka").some((ep: Episode) => ep.id === episode.id)) detectedEdition = "Sri Lanka";
    // For DB episodes, use the edition from the episode object
    else if (episode.edition) detectedEdition = episode.edition;
  }

  const edition = detectedEdition || "Dubai";

  // For backward compatibility and specialized content
  const editionKey = edition.toLowerCase() === "sri lanka" || edition.toLowerCase() === "sri-lanka" || edition.toLowerCase() === "colombo" ? "sri-lanka" : edition.toLowerCase() as "dubai" | "singapore" | "sri-lanka";

  // Hardcoded edition names for checking
  const hardcodedEditionNames = ['dubai', 'singapore', 'sri lanka', 'sri-lanka', 'colombo'];
  const isHardcodedEdition = hardcodedEditionNames.includes(editionKey);

  // For ReelsSection - only pass hardcoded edition types, undefined for DB editions
  const reelsEdition = isHardcodedEdition && editionKey !== "sri-lanka" 
    ? edition as "Dubai" | "Singapore" 
    : undefined;

  // Show loading state while fetching episode
  if (loading) {
    return (
      <main className="flex flex-col items-center relative w-full bg-white">
        <GlobalHeader />
        <div className="w-full h-[50vh] flex items-center justify-center">
          <div className="text-gray-500">Loading episode...</div>
        </div>
      </main>
    );
  }

  const videoSlides = getVideoSlidesByEdition(editionKey);

  // Use the specific episode's video content if available, otherwise fall back to edition slides
  const currentVideo = {
    id: episode?.id ? String(episode.id) : videoSlides[0]?.id || 1,
    title: episode?.title || videoSlides[0]?.title || "Episode",
    videoUrl: episode?.videoUrl || videoSlides[0]?.videoUrl || "",
    thumbnail: episode?.image || videoSlides[0]?.thumbnail || "",
  };

  // Episode Schema
  const episodeSchema = episode ? {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "name": episode.title,
    "description": episode.description,
    "url": `https://talentunwrapped.com/episode/${episode.id}`,
    "datePublished": episode.date,
    "image": episode.image || getYoutubeThumbnail(episode.videoUrl || ""),
    "associatedMedia": {
      "@type": "MediaObject",
      "contentUrl": episode.videoUrl,
    },
    "partOfSeries": {
      "@type": "PodcastSeries",
      "name": "Talent Unwrapped",
      "url": "https://talentunwrapped.com",
    },
    "actor": episode.speakers?.map(s => ({
      "@type": "Person",
      "name": s.name,
    })),
    "genre": ["Business", "Leadership"],
    "inLanguage": "en",
  } : undefined;

  // Convert episode speakers to Speaker type for the section
  // If episode has no speakers, specificSpeakers will be undefined and the component will fall back to edition speakers
  const specificSpeakers: Speaker[] | undefined = episode?.speakers?.map((s: EpisodeSpeaker, index: number) => ({
    id: index + 100,
    title: s.role || "",
    views: "",
    name: s.name,
    position: s.role || "",
    image: s.avatar || "",
    linkedinUrl: s.linkedinUrl,
    edition: edition,
  }));

  // Handle video playback events
  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  const content = (
    <div
      className="flex flex-col items-center relative w-full overflow-x-clip"
      data-model-id="905:6609"
    >
      {/* Hero Section with Video Carousel - RESPONSIVE */}
      <section
        ref={sectionRef}
        className="relative w-full bg-white px-4 sm:px-6 md:px-8 lg:px-12 pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12 lg:pb-16"
      >
        {/* Mobile Video Player - Single Video (visible only on mobile) */}
        <div className="block md:hidden relative w-full">
          <div
            className="relative w-full bg-[rgba(0,0,0,0.2)] rounded-lg overflow-hidden mx-auto"
            style={{
              height: "clamp(240px, 60vw, 350px)",
            }}
          >
            {/* Single Video / Thumbnail */}
            <div className="absolute inset-0 w-full h-full">
              {isMobile && isPlaying && currentVideo.videoUrl ? (
                <>
                  {currentVideo.videoUrl.includes("youtube") || currentVideo.videoUrl.includes("youtu.be") ? (
                    <>
                      <iframe
                        className="w-full h-full object-cover"
                        src={getEmbedUrl(currentVideo.videoUrl, true)}
                        title={currentVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        scrolling="no"
                        style={{ border: "none", overflow: "hidden", pointerEvents: "auto" }}
                      />
                      {/* Overlay to catch taps and pause/stop instead of redirecting to YouTube */}
                      <div
                        className="absolute inset-0 z-30 cursor-pointer bg-transparent"
                        style={{ height: '80%' }} // Leave bottom 20% for YouTube native controls if needed
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlaying(false);
                        }}
                      />
                    </>
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src={`${currentVideo.videoUrl}#t=0.001`}
                      preload="metadata"
                      playsInline
                      onEnded={handleVideoEnded}
                      controls={true}
                    />
                  )}
                </>
              ) : (
                currentVideo.thumbnail ? (
                  <img
                    className="w-full h-full object-cover"
                    alt={currentVideo.title}
                    src={currentVideo.thumbnail}
                  />
                ) : (
                  currentVideo.videoUrl && (
                    currentVideo.videoUrl.includes("youtube") || currentVideo.videoUrl.includes("youtu.be") ? (
                      <img
                        className="w-full h-full object-cover"
                        alt={currentVideo.title}
                        src={getYoutubeThumbnail(currentVideo.videoUrl)}
                      />
                    ) : (
                      <video
                        className="w-full h-full object-cover"
                        src={`${currentVideo.videoUrl}#t=0.001`}
                        preload="metadata"
                        playsInline
                        muted
                      />
                    )
                  )
                )
              )}
            </div>

            {/* Edition Badge - Mobile */}
            {!isPlaying && (
              <div
                className="inline-flex items-center justify-center gap-1 absolute bg-[#ed2939] rounded-full z-20"
                style={{
                  top: "clamp(0.5rem, 2vw, 0.875rem)",
                  left: "clamp(0.5rem, 2vw, 0.875rem)",
                  padding:
                    "clamp(0.25rem, 0.8vw, 0.375rem) clamp(0.5rem, 1.8vw, 0.75rem)",
                }}
              >
                <PlayCircleFilledIcon
                  style={{
                    width: "clamp(10px, 2.8vw, 14px)",
                    height: "clamp(10px, 2.8vw, 14px)",
                  }}
                  fill="white"
                />
                <span
                  className="font-['Geist',Helvetica] font-semibold text-white whitespace-nowrap leading-none"
                  style={{
                    fontSize: "clamp(0.5rem, 2vw, 0.625rem)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {edition} {HERO_CONTENT.EDITION_SUFFIX}
                </span>
              </div>
            )}

            {/* Play Button - Mobile */}
            {!isPlaying && (
              <button
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/95 active:bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                onClick={handlePlayVideo}
                aria-label="Play video"
                type="button"
                style={{
                  width: "clamp(48px, 13vw, 60px)",
                  height: "clamp(48px, 13vw, 60px)",
                }}
              >
                <PlayIcon
                  fill="#232323"
                  stroke="none"
                  style={{
                    width: "clamp(20px, 5.5vw, 26px)",
                    height: "clamp(20px, 5.5vw, 26px)",
                  }}
                />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Video Container - Single Video (hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="hidden md:block w-full"
        >
          <div
            className="relative w-full bg-[rgba(0,0,0,0.2)] rounded-xl lg:rounded-3xl overflow-hidden"
            style={{
              height: "clamp(550px, 50vw, 800px)",
              maxHeight: "85vh",
            }}
          >
            {/* Single Video / Thumbnail */}
            <div className="absolute inset-0 w-full h-full">
              {!isMobile && isPlaying && currentVideo.videoUrl ? (
                <>
                  {currentVideo.videoUrl.includes("youtube") || currentVideo.videoUrl.includes("youtu.be") ? (
                    <>
                      {(() => {
                        const embedUrl = getEmbedUrl(currentVideo.videoUrl, true);
                        if (!embedUrl.includes('youtube.com/embed')) {
                          return (
                            <video
                              ref={videoRef}
                              className="w-full h-full object-cover"
                              src={currentVideo.videoUrl}
                              preload="metadata"
                              playsInline
                              onEnded={handleVideoEnded}
                              controls={true}
                            />
                          );
                        }
                        return (
                          <iframe
                            className="w-full h-full object-cover"
                            src={embedUrl}
                            title={currentVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            scrolling="no"
                            style={{ border: "none", overflow: "hidden", pointerEvents: "auto" }}
                          />
                        );
                      })()}
                      <div
                        className="absolute inset-0 z-30 cursor-pointer bg-transparent"
                        style={{ height: '85%' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlaying(false);
                        }}
                      />
                    </>
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src={`${currentVideo.videoUrl}#t=0.001`}
                      preload="metadata"
                      playsInline
                      onEnded={handleVideoEnded}
                      controls={true}
                    />
                  )}
                </>
              ) : (
                currentVideo.thumbnail ? (
                  <img
                    className="w-full h-full object-cover"
                    alt={currentVideo.title}
                    src={currentVideo.thumbnail}
                  />
                ) : (
                  currentVideo.videoUrl && (
                    currentVideo.videoUrl.includes("youtube") || currentVideo.videoUrl.includes("youtu.be") ? (
                      <img
                        className="w-full h-full object-cover"
                        alt={currentVideo.title}
                        src={getYoutubeThumbnail(currentVideo.videoUrl)}
                      />
                    ) : (
                      <video
                        className="w-full h-full object-cover"
                        src={`${currentVideo.videoUrl}#t=0.001`}
                        preload="metadata"
                        playsInline
                        muted
                      />
                    )
                  )
                )
              )}
            </div>

            {/* Edition Badge - Desktop */}
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="inline-flex items-center justify-center gap-2 px-3 md:px-4 lg:px-5 py-1.5 md:py-2 lg:py-2.5 absolute bg-[#ed2939] rounded-full z-20"
                style={{
                  top: "clamp(1rem, 2vw, 2.5rem)",
                  left: "clamp(1rem, 2vw, 3rem)",
                }}
              >
                <PlayCircleFilledIcon
                  className="flex-shrink-0"
                  style={{
                    width: "clamp(16px, 1.8vw, 24px)",
                    height: "clamp(16px, 1.8vw, 24px)",
                  }}
                  fill="white"
                />
                <span
                  className="font-['Geist',Helvetica] font-semibold text-white whitespace-nowrap leading-none"
                  style={{
                    fontSize: "clamp(0.75rem, 1.1vw, 1.25rem)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {edition} {HERO_CONTENT.EDITION_SUFFIX}
                </span>
              </motion.div>
            )}

            {/* Play Button - Desktop */}
            {!isPlaying && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                type="button"
                onClick={handlePlayVideo}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full flex items-center justify-center cursor-pointer z-20 shadow-xl"
                aria-label="Play podcast episode"
                style={{
                  width: "clamp(60px, 7vw, 90px)",
                  height: "clamp(60px, 7vw, 90px)",
                }}
              >
                <PlayIcon
                  fill="#232323"
                  stroke="none"
                  style={{
                    width: "clamp(24px, 2.5vw, 36px)",
                    height: "clamp(24px, 2.5vw, 36px)",
                  }}
                />
              </motion.button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Speakers Profile Section */}
      <SpeakersProfileSection
        edition={edition as "Dubai" | "Singapore" | "Sri Lanka"}
        specificSpeakers={specificSpeakers}
      />
    </div>
  );

  return (
    <>
      <SEO
        title={episode?.title || "Episode Details"}
        description={episode?.description}
        keywords={`${episode?.speakers?.map(s => s.name).join(", ")}, ${episode?.title}, talent unwrapped, ${edition} podcast`}
        url={`/episode/${episodeId}`}
        image={episode?.image || getYoutubeThumbnail(episode?.videoUrl || "")}
        type="article"
        publishedTime={episode?.date}
        podcastSchema={episodeSchema}
      />
      <main className="flex flex-col items-center relative w-full bg-white">
        <div className="w-full">
          <GlobalHeader />
        </div>

        {content}

        {/* Key Questions Section */}
        <div className="w-full overflow-x-clip">
          <KeyQuestionsSection edition={editionKey} episodeId={episode?.id} speakers={episode?.speakers} />
        </div>

        {/* Reels Section - Show for Dubai/Singapore editions OR any DB episode with reels */}
        {(editionKey !== "sri-lanka" || (episode && episode.id)) && (
          <div className="w-full overflow-x-clip">
            <ReelsSection 
              edition={reelsEdition} 
              episodeId={episodeId} 
            />
          </div>
        )}

        {/* Episode Details Section - Outside layout for full-width scrolling text */}
        <div className={`w-full overflow-x-clip ${editionKey === "sri-lanka" ? "mt-[-20px] lg:mt-[-30px]" : ""}`}>
          <EpisodeDetailsSection episodeImages={episode?.images} />
        </div>

        {/* About Section - The Three Chapters */}
        <div className="w-full overflow-x-clip">
          <TalentIntroductionSection />
        </div>

        {/* Footer sections */}
        <div className="w-full overflow-x-clip">
          <SubmitFormSection />
          <AboutUsSection />
          <FooterSection />
        </div>
      </main>
    </>
  );
};

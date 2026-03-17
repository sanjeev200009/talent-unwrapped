import { useEffect, useRef, useState } from "react";
import { REELS_DATA } from "@/data";
import { BackArrowIcon, NextArrowIcon } from "@/components/common/Icons";
import { fetchReelsByEpisode, transformDbReelToReel } from "@/services/api/client";

/**
 * Helper to transform YouTube URLs into embed URLs
 */
const getEmbedUrl = (url: string, autoplay: boolean = true, mute: boolean = true): string => {
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
      const muteParam = mute ? "1" : "0";
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&mute=${muteParam}&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&controls=1&loop=1`;
    }
    
    // Return original URL if no known format
    return url;
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
    return url;
  }
};

interface ReelsSectionProps {
  edition?: "Dubai" | "Singapore" | "Sri Lanka";
  episodeId?: string | number;
}

export const ReelsSection = ({ edition, episodeId }: ReelsSectionProps): JSX.Element => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [dbReels, setDbReels] = useState<ReturnType<typeof transformDbReelToReel>[]>([]);

  // Fetch reels from DB if episodeId is provided
  useEffect(() => {
    const loadDbReels = async () => {
      if (episodeId) {
        const reels = await fetchReelsByEpisode(String(episodeId));
        setDbReels(reels.map(transformDbReelToReel));
      } else {
        setDbReels([]);
      }
    };
    loadDbReels();
  }, [episodeId]);

  // Filter reels: prioritize DB reels for episode, then hardcoded for valid editions
  // For DB editions without DB reels, show nothing (empty array)
  const reelVideos = episodeId && dbReels.length > 0
    ? dbReels
    : edition && !edition.includes(' ') // Only use hardcoded edition if it's a simple name (Dubai, Singapore, Sri Lanka)
      ? REELS_DATA.filter((reel) => reel.edition === edition)
      : []; // For DB editions or invalid editions, show nothing (no fallback to all reels)

  // Track active slide using IntersectionObserver (more accurate for mobile)
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (!isMobile) return;

    const observerOptions = {
      root: scrollContainerRef.current,
      rootMargin: "0px",
      threshold: 0.6, // Item must be 60% visible to be considered "active"
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = slideRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1) {
            setActiveIndex((prev) => (prev !== index ? index : prev));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observer all slides
    slideRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reelVideos.length]);

  // Pause playing when scrolling starts (detecting scroll movement)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScrollStart = () => {
      setPlayingIndex(null); // Pause immediately on any scroll
    };

    container.addEventListener("scroll", handleScrollStart, { passive: true });
    return () => container.removeEventListener("scroll", handleScrollStart);
  }, []);

  // Auto-play on mobile after a short delay of inactivity
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    if (isMobile) {
      const timer = setTimeout(() => {
        setPlayingIndex(activeIndex);
      }, 800); // Faster response time for autoplay

      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      setPlayingIndex(null); // Pause videos on scroll
      if (direction === "left") {
        scrollContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  // Don't render if there are no reels to show
  if (reelVideos.length === 0) {
    return null;
  }

  return (
    <section
      id="reels"
      ref={sectionRef}
      className="relative w-full bg-white pt-4 pb-4 sm:pt-8 sm:pb-8 md:pt-10 md:pb-10 lg:pt-12 lg:pb-12"
    >
      <div className="relative w-full">
        {/* Left Scroll Button */}
        <button
          className="hidden xl:flex absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 items-center justify-center cursor-pointer z-20 transition-transform hover:scale-110"
          onClick={() => handleScroll("left")}
          type="button"
          aria-label="Scroll left"
        >
          <BackArrowIcon
            className="w-full h-full object-contain pointer-events-none"
            size="100%"
          />
        </button>

        <div
          className="w-full max-w-full overflow-x-auto overscroll-x-contain scrollbar-hide snap-x snap-mandatory relative pl-4 pr-4 sm:pl-6 sm:pr-6 md:pl-8 md:pr-8 py-12"
          ref={scrollContainerRef}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex w-fit lg:w-full gap-4 sm:gap-6 lg:gap-6 lg:snap-none">
            {reelVideos.map((reel, index) => (
              <div
                key={reel.id}
                ref={(el) => (slideRefs.current[index] = el)}
                className="relative flex-shrink-0 group overflow-hidden shadow-lg bg-black rounded-2xl md:rounded-3xl
                w-[85vw] sm:w-[60vw] md:w-[45vw] h-[600px] snap-center
                lg:w-[calc((100%-72px)/3.5)] lg:h-[850px] lg:snap-align-none transition-all duration-300 transform hover:scale-[1.02] hover:z-10 origin-center"
                onMouseEnter={() => setPlayingIndex(index)}
                onMouseLeave={() => setPlayingIndex(null)}
                onClick={() => window.open(reel.videoUrl, '_blank')}
              >
                {/* Media Container */}
                <div className="absolute inset-0 w-full h-full bg-black">
                  {playingIndex === index ? (
                    <iframe
                      src={getEmbedUrl(reel.videoUrl, true, true)}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={reel.title}
                      style={{ border: 'none' }}
                    />
                  ) : (
                    <img
                      src={reel.thumbnailUrl}
                      alt={reel.title}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  )}
                </div>

                {/* Overlay with Title */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 pointer-events-none flex flex-col justify-end p-4 sm:p-5 md:p-6 transition-opacity duration-300"
                  style={{ opacity: playingIndex === index ? 0 : 1 }}
                >
                  <h3 className="[font-family:'Geist',Helvetica] font-semibold text-white text-lg sm:text-xl md:text-2xl lg:text-xl tracking-[-0.40px] leading-[normal] mb-2 sm:mb-3 lg:mb-2">
                    {reel.title}
                  </h3>
                  <p className="[font-family:'Geist',Helvetica] font-normal text-white/80 text-sm sm:text-base lg:text-sm leading-[normal]">
                    {reel.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Scroll Button */}
        <button
          className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 items-center justify-center cursor-pointer z-20 hover:scale-110"
          onClick={() => handleScroll("right")}
          type="button"
          aria-label="Scroll right"
        >
          <NextArrowIcon
            className="w-full h-full object-contain pointer-events-none"
            size="100%"
          />
        </button>
      </div>

      <div className="flex lg:hidden justify-center items-center gap-2 mt-4">
        {reelVideos.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              slideRefs.current[index]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
              });
            }}
            className={`transition-all duration-300 rounded-full glass-button ${activeIndex === index
              ? "w-8 h-2 bg-[#7bb302]"
              : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            aria-label={`Go to reel ${index + 1}`}
            aria-current={activeIndex === index ? "step" : undefined}
          />
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </section>
  );
};

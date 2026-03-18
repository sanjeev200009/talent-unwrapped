import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LANDING_VIDEO_SLIDES } from "@/data/videoSlides";
import { ASSETS } from "@/constants/assets";
import {
  PlayCircleFilledIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon
} from "@/components/common/Icons";
import { HERO_CONTENT } from "@/constants/copy";
import { fetchDbEpisodes } from "@/services/api/client";
import { Episode } from "@/types";

/**
 * Helper to transform YouTube URLs into embed URLs
 */
const getEmbedUrl = (url: string, autoplay: boolean = true) => {
  try {
    const autoplayParam = autoplay ? "autoplay=1" : "autoplay=0";
    const baseParams = `&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&modestbranding=1&iv_load_policy=3&widget_referrer=${encodeURIComponent(window.location.href)}`;

    if (url.includes("youtube.com/embed")) {
      return `${url.split('?')[0]}?${autoplayParam}${baseParams}`;
    }
    if (url.includes("youtu.be")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?${autoplayParam}${baseParams}` : url;
    }
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}?${autoplayParam}${baseParams}` : url;
    }
    return url;
  } catch (e) {
    return url;
  }
};

/**
 * HeroBannerSection - Exact Figma Design Recreation
 * Desktop: 1440px layout with absolute positioning
 * Mobile/Tablet: Fully responsive with clamp() values
 */
export const HeroBannerSection = (): JSX.Element => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const [videoSlides, setVideoSlides] = useState<any[]>(LANDING_VIDEO_SLIDES);

  useEffect(() => {
    const loadDbEpisodes = async () => {
      try {
        const episodes = await fetchDbEpisodes();
        if (episodes && episodes.length > 0) {
          const dbSlides = episodes.map((ep) => ({
            id: ep.id,
            thumbnail: ep.image || ep.thumbnailUrl || "",
            title: ep.title,
            edition: ep.edition,
            videoUrl: ep.videoUrl,
          }));
          
          // Combine and filter out duplicates if needed, but here we just append
          // Ensuring unique slides by ID
          const combined = [...LANDING_VIDEO_SLIDES];
          dbSlides.forEach(dbSlide => {
            if (!combined.some(s => s.id === dbSlide.id)) {
              combined.push(dbSlide);
            }
          });
          
          setVideoSlides(combined);
        }
      } catch (error) {
        console.error("Failed to load DB episodes for Hero:", error);
      }
    };
    
    loadDbEpisodes();
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % videoSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [videoSlides.length, isPlaying]);

  useEffect(() => {
    setIsPlaying(false);
  }, [currentSlide]);

  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentSlide(
      (prev) => (prev - 1 + videoSlides.length) % videoSlides.length,
    );
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % videoSlides.length);
  };

  const goToSlide = (index: number) => {
    setIsPlaying(false);
    setCurrentSlide(index);
  };

  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const scrollToSpeakers = () => {
    const speakersSection = document.getElementById("speakers");
    if (speakersSection) {
      speakersSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      className="relative w-full bg-white mx-auto overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12"
      style={{
        paddingBottom: "clamp(20px, 4vw, 40px)",
      }}
    >
      {/* ========== MOBILE LAYOUT (< 768px) ========== */}
      <div className="md:hidden">
        {/* Mobile Header Section */}
        <div className="relative w-full mb-3 px-0">
          {/* First Line: Logo + Heading + Icon Button */}
          <div className="flex items-center gap-2 mb-2">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center"
              style={{
                width: "clamp(126px, 46vw, 165px)",
                height: "clamp(32px, 11.8vw, 42px)",
              }}
            >
              <img
                className="w-full h-full object-contain scale-[2.6]"
                alt="Prasperant Logo"
                src={ASSETS.prasperantLogo}
              />
            </motion.div>

            {/* Mobile Heading + Button */}
            <div className="flex-1">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="font-['Geist',Helvetica] font-medium text-[#232323] inline"
                style={{
                  fontSize: "clamp(1.5rem, 6.8vw, 2.5rem)",
                  lineHeight: "1.25",
                  letterSpacing: "-0.03em",
                }}
              >
                {HERO_CONTENT.FEEL_HEADING}
              </motion.h2>

              {/* Decorative Icon - inline after "feel" */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                onClick={scrollToSpeakers}
                className="inline-block cursor-pointer bg-transparent border-none p-0 active:scale-95 transition-transform align-middle"
                aria-label="Go to speakers section"
                type="button"
                style={{
                  width: "clamp(4.5rem, 19.5vw, 8.5rem)",
                  height: "auto",
                  marginLeft: "clamp(4px, 1.5vw, 8px)",
                  verticalAlign: "middle",
                  transform: "translateY(clamp(-6px, -1.2vw, -4px))",
                }}
              >
                <img
                  src="https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770802160/Frame_1000002831_4_bzex2d.png"
                  alt=""
                  className="block w-full h-auto"
                />
              </motion.button>
            </div>
          </div>

          {/* Second Line: Green Heading - Full Width */}
          <div className="w-full -mx-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-['Geist',Helvetica] font-medium text-[#7bb302] leading-tight block whitespace-nowrap"
              style={{
                fontSize: "clamp(2.5rem, 16vw, 5rem)",
                letterSpacing: "-0.07em",
                width: "100%",
              }}
            >
              {HERO_CONTENT.STAY_HEADING}
            </motion.h1>
          </div>
        </div>

        {/* Mobile Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full"
        >
          <div
            className="relative w-full bg-[rgba(0,0,0,0.2)] rounded-lg overflow-hidden"
            style={{
              height: "clamp(240px, 60vw, 350px)",
            }}
          >
            {/* Video Slides */}
            <div className="absolute inset-0">
              {videoSlides.map((slide: any, index: number) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0"
                    }`}
                >
                  {isMobile && isPlaying && index === currentSlide && slide.videoUrl ? (
                    <>
                      {slide.videoUrl.includes("youtube") || slide.videoUrl.includes("youtu.be") ? (
                        <>
                          <iframe
                            className="w-full h-full object-cover"
                            src={getEmbedUrl(slide.videoUrl || "", true)}
                            title={slide.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ pointerEvents: "auto" }}
                          />
                          <div
                            className="absolute inset-0 z-30 cursor-pointer bg-transparent"
                            style={{ height: '80%' }}
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
                          src={slide.videoUrl}
                          controls
                          autoPlay
                          onEnded={handleVideoEnded}
                          controlsList="nodownload"
                          playsInline
                        />
                      )}
                    </>
                  ) : (
                    <img
                      className="w-full h-full object-cover"
                      alt={slide.title}
                      src={slide.thumbnail}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Edition Badge - Mobile */}
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
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
                  {videoSlides[currentSlide].edition} {HERO_CONTENT.EDITION_SUFFIX}
                </span>
              </motion.div>
            )}

            {/* Play Button - Mobile */}
            {!isPlaying && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0, x: "-50%", y: "-50%" }}
                animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                type="button"
                onClick={handlePlayVideo}
                className="absolute top-1/2 left-1/2 glass-button-white active:bg-white rounded-full flex items-center justify-center cursor-pointer z-20 shadow-lg"
                aria-label="Play podcast episode"
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
                    marginLeft: "3px", // Optical centering
                  }}
                />
              </motion.button>
            )}

            {/* Navigation Arrows - Mobile */}
            {!isPlaying && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute top-1/2 -translate-y-1/2 glass-button-white active:bg-white rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all z-20 shadow-md touch-manipulation"
                  aria-label="Previous video"
                  style={{
                    left: "clamp(0.5rem, 2.2vw, 0.75rem)",
                    width: "clamp(36px, 9.5vw, 44px)",
                    height: "clamp(36px, 9.5vw, 44px)",
                  }}
                >
                  <ChevronLeftIcon
                    className="w-full h-full"
                    color="#232323"
                    style={{
                      width: "clamp(16px, 4.2vw, 20px)",
                      height: "clamp(16px, 4.2vw, 20px)",
                    }}
                  />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute top-1/2 -translate-y-1/2 glass-button-white active:bg-white rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all z-20 shadow-md touch-manipulation"
                  aria-label="Next video"
                  style={{
                    right: "clamp(0.5rem, 2.2vw, 0.75rem)",
                    width: "clamp(36px, 9.5vw, 44px)",
                    height: "clamp(36px, 9.5vw, 44px)",
                  }}
                >
                  <ChevronRightIcon
                    className="w-full h-full"
                    color="#232323"
                    style={{
                      width: "clamp(16px, 4.2vw, 20px)",
                      height: "clamp(16px, 4.2vw, 20px)",
                    }}
                  />
                </button>
              </>
            )}

            {/* Pagination - Mobile */}
            {!isPlaying && (
              <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center z-20"
                style={{
                  bottom: "clamp(0.5rem, 2.2vw, 0.75rem)",
                  gap: "clamp(0.375rem, 1.6vw, 0.5rem)",
                }}
              >
                {videoSlides.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`rounded-full transition-all duration-300 cursor-pointer touch-manipulation ${index === currentSlide
                      ? "bg-white"
                      : "bg-white/50 active:bg-white/75"
                      }`}
                    style={{
                      width:
                        index === currentSlide
                          ? "clamp(16px, 4vw, 20px)"
                          : "clamp(6px, 2vw, 8px)",
                      height: "clamp(5px, 1.5vw, 6px)",
                    }}
                    aria-label={`Go to video ${index + 1}`}
                    aria-current={index === currentSlide ? "true" : "false"}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ========== TABLET & DESKTOP LAYOUT (>= 768px) ========== */}
      <div
        className="hidden md:flex items-end w-full"
        style={{
          minHeight: "clamp(120px, 15vh, 180px)",
          gap: "clamp(20px, 3vw, 40px)",
        }}
      >
        {/* Logo - Far Left */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-shrink-0 bg-white rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            width: "clamp(280px, 28vw, 420px)",
            height: "clamp(84px, 8.5vw, 126px)",
          }}
        >
          <img
            className="w-full h-full object-contain scale-[2.0]"
            alt="Prasperant Logo"
            src={ASSETS.prasperantLogo}
          />
        </motion.div>

        {/* Text Content - Center-Left (stacked) */}
        <div className="flex flex-col gap-0 flex-1">
          {/* First line: "Conversations that feel" + Button */}
          <div className="flex items-center gap-3">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="font-['Geist',Helvetica] font-medium text-[#232323] leading-tight"
              style={{
                fontSize: "clamp(25px, 3.6vw, 60px)",
                letterSpacing: "-0.04em",
              }}
            >
              {HERO_CONTENT.FEEL_HEADING}
            </motion.h2>

            {/* Decorative Icon - Right after text */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToSpeakers}
              className="flex-shrink-0 cursor-pointer bg-transparent border-none p-0"
              aria-label="Go to speakers section"
              type="button"
              style={{
                width: "clamp(80px, 8.5vw, 120px)",
                height: "auto",
              }}
            >
              <img
                className="w-full h-full"
                alt=""
                src="https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770802160/Frame_1000002831_4_bzex2d.png"
              />
            </motion.button>
          </div>

          {/* Second line: "ideas that stay" */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="font-['Geist',Helvetica] font-medium text-[#7bb302] leading-[1] whitespace-nowrap"
            style={{
              fontSize: "clamp(55px, 9.2vw, 165px)",
              letterSpacing: "-0.02em",
            }}
          >
            {HERO_CONTENT.STAY_HEADING}
          </motion.h1>
        </div>
      </div>

      {/* Desktop Video Player - Positioned Below Header */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        className="hidden md:block w-full"
        style={{ marginTop: "clamp(40px, 6vw, 80px)" }}
      >
        <div
          className="relative w-full bg-[rgba(0,0,0,0.2)] rounded-xl lg:rounded-3xl overflow-hidden"
          style={{
            height: "clamp(550px, 50vw, 800px)",
            maxHeight: "85vh",
          }}
        >
          {/* Video Slides */}
          <div className="absolute inset-0 w-full h-full">
            {videoSlides.map((slide: any, index: number) => (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                {!isMobile && isPlaying && index === currentSlide && slide.videoUrl ? (
                  <>
                    {slide.videoUrl.includes("youtube") || slide.videoUrl.includes("youtu.be") ? (
                      <>
                        <iframe
                          className="w-full h-full object-cover"
                          src={getEmbedUrl(slide.videoUrl || "", true)}
                          title={slide.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ pointerEvents: "auto" }}
                        />
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
                        src={slide.videoUrl}
                        controls
                        autoPlay
                        onEnded={handleVideoEnded}
                        controlsList="nodownload"
                        playsInline
                      />
                    )}
                  </>
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    alt={slide.title}
                    src={slide.thumbnail}
                  />
                )}
              </div>
            ))}
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
                {videoSlides[currentSlide].edition} {HERO_CONTENT.EDITION_SUFFIX}
              </span>
            </motion.div>
          )}

          {/* Play Button - Desktop */}
          {!isPlaying && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0, x: "-50%", y: "-50%" }}
              animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              type="button"
              onClick={handlePlayVideo}
              className="absolute top-1/2 left-1/2 glass-button-white hover:bg-white rounded-full flex items-center justify-center cursor-pointer z-20 shadow-xl"
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
                  marginLeft: "4px", // Optical centering
                }}
              />
            </motion.button>
          )}

          {/* Navigation Arrows - Desktop */}
          {!isPlaying && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute top-1/2 -translate-y-1/2 glass-button-white hover:bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 z-20 shadow-lg"
                aria-label="Previous video"
                style={{
                  left: "clamp(1rem, 2vw, 1.875rem)",
                  width: "clamp(50px, 4.5vw, 60px)",
                  height: "clamp(50px, 4.5vw, 60px)",
                }}
              >
                <ChevronLeftIcon
                  className="w-full h-full"
                  color="#232323"
                  style={{
                    width: "clamp(20px, 2.2vw, 28px)",
                    height: "clamp(20px, 2.2vw, 28px)",
                  }}
                />
              </button>

              <button
                onClick={handleNext}
                className="absolute top-1/2 -translate-y-1/2 glass-button-white hover:bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 z-20 shadow-lg"
                aria-label="Next video"
                style={{
                  right: "clamp(1rem, 2vw, 1.875rem)",
                  width: "clamp(50px, 4.5vw, 60px)",
                  height: "clamp(50px, 4.5vw, 60px)",
                }}
              >
                <ChevronRightIcon
                  className="w-full h-full"
                  color="#232323"
                  style={{
                    width: "clamp(20px, 2.2vw, 28px)",
                    height: "clamp(20px, 2.2vw, 28px)",
                  }}
                />
              </button>
            </>
          )}

          {/* Pagination - Desktop */}
          {!isPlaying && (
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 z-20"
              style={{
                bottom: "clamp(1rem, 2vw, 1.875rem)",
              }}
            >
              {videoSlides.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                    }`}
                  style={{
                    width:
                      index === currentSlide
                        ? "clamp(24px, 2.5vw, 32px)"
                        : "clamp(10px, 1.2vw, 12px)",
                    height: "clamp(8px, 0.9vw, 12px)",
                  }}
                  aria-label={`Go to video ${index + 1}`}
                  aria-current={index === currentSlide ? "true" : "false"}
                />
              ))}
            </div>
          )}

          {/* Video Counter - Desktop */}
          <div
            className="absolute bg-black/60 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full z-20"
            style={{
              bottom: "clamp(1rem, 2vw, 1.875rem)",
              right: "clamp(1rem, 2vw, 1.875rem)",
            }}
          >
            <span
              className="font-['Geist',Helvetica] font-medium text-white"
              style={{
                fontSize: "clamp(0.625rem, 0.9vw, 0.875rem)",
              }}
            >
              {currentSlide + 1} / {videoSlides.length}
            </span>
          </div>
        </div>
      </motion.div>
    </section >
  );
};

import type { Episode, EpisodeSpeaker } from "../../types";
import { METADATA, NAV_LABELS } from "@/constants/copy";
import { MediaLoader } from "../../components/common";

interface EpisodeCardProps {
  episode: Episode;
  onViewEpisode: (episodeId: string | number) => void;
}

/**
 * Helper to transform YouTube URLs into embed URLs
 */
// Removed getEmbedUrl as navigation is now handled by the parent


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
 * Reusable episode card component for displaying episode information
 * Handles UI rendering and user interactions for a single episode
 */
export const EpisodeCard = ({
  episode,
  onViewEpisode,
}: EpisodeCardProps): JSX.Element => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onViewEpisode(episode.id);
  };

  const handleCardClick = () => {
    onViewEpisode(episode.id);
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="flex flex-col bg-white rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.02] text-left border-none cursor-pointer group outline-none focus:ring-2 focus:ring-[#7bb302] focus:ring-offset-2"
    >
      {/* Episode Image and Featured Badge */}
      <div className="relative w-full h-[240px] bg-[#2d2d2d] overflow-hidden">
        {episode.image ? (
          <MediaLoader
            src={episode.image}
            alt={episode.title}
            className="group-hover:scale-110 transition-transform duration-300"
            containerClassName="w-full h-full"
          />
        ) : (
          episode.videoUrl && (
            episode.videoUrl.includes("youtube") || episode.videoUrl.includes("youtu.be") ? (
              <MediaLoader
                src={getYoutubeThumbnail(episode.videoUrl)}
                alt={episode.title}
                className="group-hover:scale-110 transition-transform duration-300"
                containerClassName="w-full h-full"
              />
            ) : (
              <video
                src={`${episode.videoUrl}#t=0.001`}
                className="w-full h-full object-cover"
                preload="metadata"
                playsInline
                muted
              />
            )
          )
        )}
        {episode.featured && (
          <div className="absolute top-[16px] left-[16px] bg-[#7c3] text-white text-[11px] font-bold px-[12px] py-[6px] rounded-[20px] uppercase tracking-[0.05em] z-10">
            {METADATA.FEATURED}
          </div>
        )}
        {/* Play Button - Always show if videoUrl exists */}
        {episode.videoUrl && (
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300 z-10"
            aria-label="Play video"
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-16 h-16 bg-[#7bb302] rounded-full flex items-center justify-center hover:scale-110 active:scale-95">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="white"
                className="ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Episode Content */}
      <div className="flex flex-col p-[24px] flex-1">
        {/* Category Badge */}
        <div className="mb-[12px]">
          <span className="text-[#ff4444] text-[11px] font-bold tracking-[0.1em] uppercase">
            {episode.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-[#1a1a1a] text-[20px] font-bold leading-[1.3] mb-[12px]">
          {episode.title}
        </h2>

        {/* Description */}
        <p className="text-[#666666] text-[14px] leading-[1.6] mb-[20px] flex-1">
          {episode.description}
        </p>

        {/* Duration and Date */}
        <div className="flex items-center gap-[12px] text-[#999999] text-[12px] mb-[20px]">
          <span className="flex items-center gap-[4px]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 3.5V7L9.5 8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {episode.duration}
          </span>
          <span>•</span>
          <span>{episode.date}</span>
        </div>

        {/* Speakers Section */}
        <div className="border-t border-[#939393] pt-[20px]">
          <div className="text-[#1a1a1a] text-[11px] font-bold tracking-[0.05em] uppercase mb-[12px]">
            {NAV_LABELS.SPEAKERS}
          </div>
          <div className="flex flex-row lg:flex-col gap-[12px] overflow-x-auto lg:overflow-x-visible scrollbar-hide pb-2 lg:pb-0 overscroll-x-contain">
            {episode.speakers?.map((speaker: EpisodeSpeaker, index: number) => (
              <div
                key={index}
                className="flex items-center gap-[12px] flex-shrink-0 w-[180px] lg:w-full"
              >
                <MediaLoader
                  src={speaker.avatar}
                  alt={speaker.name}
                  containerClassName="w-[32px] h-[32px] rounded-full bg-[#e5e5e5] overflow-hidden flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[#1a1a1a] text-[13px] font-semibold truncate">
                    {speaker.name}
                  </div>
                  {speaker.role && (
                    <div className="text-[#999999] text-[11px] truncate">
                      {speaker.role}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

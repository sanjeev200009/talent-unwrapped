import { EpisodeLayout } from "../components";
import type { EditionType } from "../components/layout/EpisodeLayout";
import type { Episode } from "../types";
import { EpisodeCard } from "../features/podcasts";
import SEO from "../components/common/SEO";
import { DbSchedule, DbScheduleTask } from "../services/api/client";

interface PodcastEditionPageProps {
  edition: EditionType;
  episodes: Episode[];
  onViewEpisode: (episodeId: string | number) => void;
  children?: React.ReactNode;
  schedule?: DbSchedule | null;
  scheduleTasks?: DbScheduleTask[];
}

/**
 * Shared template for podcast edition pages (Singapore/Dubai)
 * Uses EpisodeLayout as base and renders episodes in a grid
 * Encapsulates common layout and component composition
 */
export const PodcastEditionPage = ({
  edition,
  episodes,
  onViewEpisode,
  children,
  schedule,
  scheduleTasks,
}: PodcastEditionPageProps): JSX.Element => {
  const isDubai = edition === "dubai";

  const seoData = {
    dubai: {
      title: "Dubai Edition - Building Future-Ready Talent in the GCC",
      description:
        "Talent Unwrapped Dubai Edition features conversations on HR transformation, business impact, and future-ready talent strategies in the GCC and Middle East.",
      keywords:
        "dubai podcast, GCC talent podcast, dubai leadership, middle east business, HR transformation GCC, future-ready talent dubai, UAE podcast",
      image:
        "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770693712/WhatsApp_Image_2026-02-10_at_7.20.05_AM_unwtyi.jpg",
    },
    singapore: {
      title: "Singapore Edition - Beyond Resilience & Leadership Strength",
      description:
        "Talent Unwrapped Singapore Edition explores leadership strength, organizational agility, and talent trends shaping Southeast Asia's business landscape.",
      keywords:
        "singapore leadership podcast, singapore talent trends, organizational agility singapore, southeast asia leadership, singapore business podcast, resilience leadership",
      image:
        "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770693712/Frame_1000003689_1_pq4rv5.png",
    },
    "sri-lanka": {
      title: "Sri Lanka Edition - Colombo Talent Suite Leadership Stories",
      description:
        "Talent Unwrapped Sri Lanka Edition explores leadership journeys and talent development in Colombo and across Sri Lanka's business ecosystem.",
      keywords:
        "sri lanka leadership podcast, colombo talent, sri lanka business podcast, leadership sri lanka, talent development colombo",
      image:
        "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770883420/Frame_4449057_1_1_npu1wb.png",
    },
  };

  const currentSEO = seoData[edition as keyof typeof seoData] || seoData.dubai;

  const editionSchema = {
    "@context": "https://schema.org",
    "@type": "PodcastSeason",
    "name": `Talent Unwrapped - ${edition.charAt(0).toUpperCase() + edition.slice(1)} Edition`,
    "description": currentSEO.description,
    "partOfSeries": {
      "@type": "PodcastSeries",
      "name": "Talent Unwrapped",
      "url": "https://talentunwrapped.com",
    },
    "location": {
      "@type": "Place",
      "name": edition.charAt(0).toUpperCase() + edition.slice(1),
    },
  };

  // Determine color scheme based on edition
  const titleColorClass = isDubai
    ? "text-[#ed2939]" // Dubai: Red first
    : "text-[#7cb403]"; // Singapore: Green first
  const subtitleColorClass = isDubai
    ? "text-[#7cb403]" // Dubai: Green second
    : "text-[#ed2939]"; // Singapore: Red second

  const episodesContent = (
    <section
      id="episodes"
      className="w-full bg-white py-16 sm:py-20 md:py-24 lg:py-[90px]"
      aria-label="Episode Listing"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="w-full">
          {/* Section Title */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10 lg:mb-[40px]">
            <h1 className="[font-family:'Geist',Helvetica] font-medium text-3xl sm:text-4xl md:text-5xl lg:text-[52px] tracking-[0] leading-tight lg:leading-[70px]">
              <span className={titleColorClass}>All </span>
              <span className={subtitleColorClass}>Episodes</span>
            </h1>
          </div>

          {/* Episodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8 lg:gap-[40px]">
            {episodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                onViewEpisode={onViewEpisode}
              />
            ))}
          </div>

          {/* Optional content slot for page-specific content */}
          {children && <div className="mt-16">{children}</div>}
        </div>
      </div>
    </section>
  );

  return (
    <>
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        url={`/edition/${edition}`}
        image={currentSEO.image}
        podcastSchema={editionSchema}
      />
      <EpisodeLayout 
        edition={edition} 
        showChapters 
        showContact 
        showFooter
        schedule={schedule}
        scheduleTasks={scheduleTasks}
      >
        {episodesContent}
      </EpisodeLayout>
    </>
  );
};

import { useRef, useState, useEffect } from "react";
import { LANDING_SPEAKERS_DATA } from "@/data/speakers";
import {
    BackArrowIcon, NextArrowIcon,
    PlayCircleFilledIcon,
    LinkedinIcon,
} from "@/components/common/Icons";
import type { Speaker } from "@/types";

interface SpeakersProfileSectionProps {
    edition?: "Dubai" | "Singapore" | "Sri Lanka";
    specificSpeakers?: Speaker[];
}

export const SpeakersProfileSection = ({ edition, specificSpeakers }: SpeakersProfileSectionProps): JSX.Element => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeFilter, setActiveFilter] = useState("All");
    const isManualScrollRef = useRef(true);

    const allSpeakersData = LANDING_SPEAKERS_DATA;

    // Filter speakers based on active tab
    const filteredSpeakers = allSpeakersData.filter((speaker: Speaker) => {
        if (activeFilter === "All") return true;
        return speaker.edition === activeFilter;
    });

    // Use specific speakers if provided, otherwise use filtered list
    const speakers = specificSpeakers || filteredSpeakers;

    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(speakers.length / ITEMS_PER_PAGE);
    const currentPage = Math.floor(currentIndex / ITEMS_PER_PAGE);

    // Reset pagination when filter changes
    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setCurrentIndex(0);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const handleScrollTracking = () => {
            // Only track scroll if it's manual (not programmatic)
            if (!isManualScrollRef.current) return;

            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                // Get the first article element to measure actual dimensions
                const firstArticle = container.querySelector("article");
                if (!firstArticle) return;

                const articleWidth = firstArticle.offsetWidth;

                // Get computed gap from the container
                const computedStyle = window.getComputedStyle(container);
                const gapValue = computedStyle.gap;
                const gap = parseInt(gapValue) || 16; // default to 16 if can't parse

                const itemSize = articleWidth + gap;

                // Calculate current index based on scroll position
                const scrollPosition = container.scrollLeft;
                const newIndex = Math.round(scrollPosition / itemSize);
                const maxIndex = speakers.length - 1;

                setCurrentIndex(Math.min(newIndex, maxIndex));
            }, 50);
        };

        container.addEventListener("scroll", handleScrollTracking, {
            passive: true,
        });
        return () => {
            container.removeEventListener("scroll", handleScrollTracking);
            clearTimeout(timeoutId);
        };
    }, [speakers.length]);

    const handlePaginationClick = (pageIndex: number) => {
        const newIndex = pageIndex * ITEMS_PER_PAGE;
        setCurrentIndex(newIndex);

        // Scroll the container to show the correct item
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const firstArticle = container.querySelector("article");

            if (firstArticle) {
                const articleWidth = firstArticle.offsetWidth;
                const computedStyle = window.getComputedStyle(container);
                const gapValue = computedStyle.gap;
                const gap = parseInt(gapValue) || 16;
                const itemSize = articleWidth + gap;
                const scrollPosition = newIndex * itemSize;

                // Disable manual scroll tracking during programmatic scroll
                isManualScrollRef.current = false;

                container.scrollTo({
                    left: scrollPosition,
                    behavior: "smooth",
                });

                // Re-enable manual scroll tracking after scroll completes
                setTimeout(() => {
                    isManualScrollRef.current = true;
                }, 1000);
            }
        }
    };

    const handleScroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cards = Array.from(container.querySelectorAll("article"));

            if (cards.length >= 2) {
                const firstCardLeft = cards[0].offsetLeft;
                const secondCardLeft = cards[1].offsetLeft;
                const scrollAmount = secondCardLeft - firstCardLeft;

                const newScrollLeft = direction === "left"
                    ? container.scrollLeft - scrollAmount
                    : container.scrollLeft + scrollAmount;

                container.scrollTo({
                    left: newScrollLeft,
                    behavior: "smooth"
                });
            }
        }
    };

    return (
        <section
            id="speakers"
            className="relative w-full bg-white pt-10 pb-4 sm:pt-12 sm:pb-6 md:pt-16 md:pb-8 lg:pt-[60px] lg:pb-10 overflow-hidden"
        >
            {/* Inner container with responsive padding - matches global layout only on web */}
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">

                {/* Header and Filter Row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0 relative w-full mb-6 md:mb-8">
                    <header className="flex flex-col items-start gap-2 relative flex-[0_0_auto]">
                        <h2 className="relative w-full max-w-full lg:max-w-none [font-family:'Geist',Helvetica] font-medium text-transparent text-[28px] sm:text-[34px] md:text-[40px] lg:text-[46px] xl:text-[52px] tracking-[-0.02em] sm:tracking-[-0.025em] leading-[1.3] sm:leading-[1.25] lg:leading-[1.2]">
                            <span className="text-[#7cb403]">Our </span>
                            <span className="text-[#ed2939]">Speakers</span>
                        </h2>
                    </header>

                    {!edition && !specificSpeakers && (
                        <nav
                            className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 relative flex-[0_0_auto]"
                            aria-label="Speaker categories"
                        >
                            {["All", "Singapore", "Dubai", "Sri Lanka"].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => handleFilterChange(filter)}
                                    className={`inline-flex items-center justify-center relative flex-[0_0_auto] py-2 border-b-[3px] transition-colors duration-300 ${activeFilter === filter
                                        ? "border-[#7bb302]"
                                        : "border-transparent hover:border-[#7bb302]/30"
                                        }`}
                                >
                                    <span className={`[font-family:'Geist',Helvetica] font-medium text-sm sm:text-base tracking-[0] leading-[normal] whitespace-nowrap ${activeFilter === filter ? "text-[#7bb302]" : "text-[#8d8d8d]"
                                        }`}>
                                        {filter}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Slider Content */}
                <div className="inline-flex flex-col items-start gap-3 md:gap-4 lg:gap-6 relative flex-[0_0_auto] w-full">
                    <div className="relative w-full">
                        {!edition && (
                            <>
                                {/* Left Scroll Button - positioned outside container only on XL desktop */}
                                <button
                                    className="hidden xl:flex absolute left-[-60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] items-center justify-center cursor-pointer z-10 transition-all rounded-full"
                                    onClick={() => handleScroll("left")}
                                    type="button"
                                    aria-label="Scroll left"
                                >
                                    <BackArrowIcon
                                        className="w-full h-full object-contain pointer-events-none"
                                        size="100%"
                                    />
                                </button>

                                {/* Right Scroll Button - positioned outside container only on XL desktop */}
                                <button
                                    className="hidden xl:flex absolute right-[-60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] items-center justify-center cursor-pointer z-10 transition-all rounded-full"
                                    onClick={() => handleScroll("right")}
                                    type="button"
                                    aria-label="Scroll right"
                                >
                                    <NextArrowIcon
                                        className="w-full h-full object-contain pointer-events-none"
                                        size="100%"
                                    />
                                </button>
                            </>
                        )}

                        {/* Layout: Horizontal Scroll for Mobile, Grid/Carousel for others */}
                        <div
                            ref={scrollContainerRef}
                            className={`w-full max-w-full overflow-x-auto overscroll-x-contain scrollbar-hide snap-x snap-mandatory relative pb-4 ${edition ? "md:pb-0" : ""}`}
                            style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            <div className={`flex gap-4 sm:gap-5 md:gap-6 ${edition ? (speakers.length === 1 ? "md:justify-start" : "md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6") : ""}`}>
                                {speakers.map((speaker) => (
                                    <article
                                        key={speaker.id}
                                        className={`flex flex-col h-full items-start relative flex-shrink-0 snap-start ${edition ? (speakers.length === 1 ? "w-[250px] sm:w-[270px] md:w-full md:max-w-md" : "w-[250px] sm:w-[270px] md:w-full") : "w-[250px] sm:w-[270px] md:w-[282px]"}`}
                                    >
                                        <div className="flex flex-col w-full items-start gap-1.5 sm:gap-5 md:gap-6 p-3 sm:p-5 md:p-6 relative h-full min-h-[240px] sm:min-h-[360px] md:min-h-[380px] bg-[#f8f8f8] rounded-[20px] md:rounded-[28px] border-2 border-[#7bb302] transition-all duration-300 hover:shadow-xl cursor-pointer">
                                            <div className="flex justify-between items-start w-full relative">
                                                <div
                                                    className="relative w-[90px] h-[90px] sm:w-[130px] sm:h-[130px] md:w-[139px] md:h-[139px] rounded-full flex-shrink-0"
                                                    style={{
                                                        border: "4px solid #7bb302",
                                                        padding: "4px",
                                                    }}
                                                >
                                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#00000033]">
                                                        <img
                                                            className="w-full h-full object-cover"
                                                            alt={speaker.name}
                                                            src={speaker.image}
                                                        />
                                                    </div>
                                                </div>

                                                {speaker.edition && (
                                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white shadow-sm whitespace-nowrap ${speaker.edition === "Singapore" ? "border-[#7bb302]/20" : "border-[#ed2939]/20"
                                                        }`}>
                                                        <PlayCircleFilledIcon
                                                            size={14}
                                                            fill={speaker.edition === "Singapore" ? "#7bb302" : "#ed2939"}
                                                        />
                                                        <span className={`text-[11px] sm:text-xs font-semibold tracking-wide whitespace-nowrap ${speaker.edition === "Singapore" ? "text-[#7bb302]" : "text-[#ed2939]"
                                                            }`}>
                                                            {speaker.edition}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-start gap-1 relative self-stretch w-full mb-1 sm:mb-4 min-w-0">
                                                <h3
                                                    className="relative self-stretch [font-family:'Geist',Helvetica] font-bold text-black text-sm sm:text-base md:text-lg tracking-[0] leading-tight sm:leading-[22px] md:leading-[24px] overflow-hidden text-ellipsis line-clamp-2 min-w-0"
                                                    title={speaker.name}
                                                >
                                                    {speaker.name}
                                                </h3>

                                                <p className="relative w-full font-body-small-regular font-[number:var(--body-small-regular-font-weight)] text-[#939393] text-xs sm:text-[length:var(--body-small-regular-font-size)] tracking-[var(--body-small-regular-letter-spacing)] leading-tight line-clamp-2 h-[2.5em] min-w-0">
                                                    {speaker.position}
                                                </p>
                                            </div>

                                            <div className="flex items-end justify-between relative self-stretch w-full mt-auto">
                                                <div className="inline-flex flex-col items-start relative flex-1 min-w-0 mr-2">
                                                    <p className="relative w-full mt-[-1.00px] [font-family:'Geist',Helvetica] font-bold text-black text-sm sm:text-base tracking-[0] leading-5 sm:leading-6 truncate min-w-0">
                                                        {speaker.title}
                                                    </p>

                                                    <p className="relative w-full font-body-small-regular font-[number:var(--body-small-regular-font-weight)] text-[#939393] text-xs sm:text-[length:var(--body-small-regular-font-size)] tracking-[var(--body-small-regular-letter-spacing)] leading-[var(--body-small-regular-line-height)] truncate min-w-0">
                                                        {speaker.views}
                                                    </p>
                                                </div>

                                                {speaker.linkedinUrl && (
                                                    <a
                                                        href={speaker.linkedinUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 glass-button-primary rounded-full flex items-center justify-center text-white active:scale-95 transition-all"
                                                        aria-label={`${speaker.name}'s LinkedIn profile`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <LinkedinIcon size={18} className="sm:size-5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>

                    {!edition && (
                        /* Dot Indicator (only for main landing carousel) */
                        <div className="flex items-center justify-center gap-2 w-full mt-6">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePaginationClick(index)}
                                    className={`rounded-full transition-all duration-300 glass-button ${index === currentPage ? "bg-[#7bb302] w-6 h-2" : "bg-[#d0d0d0] w-2 h-2"
                                        }`}
                                    aria-label={`Page ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </section>
    );
};

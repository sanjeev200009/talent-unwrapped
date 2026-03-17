import type { ReactNode } from "react";
import { GlobalHeader, FooterSection } from "../index";
import type { EditionType } from "../../types";
import { AboutUsSection } from "../../features/landing/AboutUsSection";
import { TheThreeChaptersSection } from "../../features/podcasts";
import { DbSchedule, DbScheduleTask } from "../../services/api/client";


interface EpisodeLayoutProps {
  edition?: EditionType;
  children?: ReactNode;
  showChapters?: boolean;
  showContact?: boolean;
  showFooter?: boolean;
  className?: string;
  schedule?: DbSchedule | null;
  scheduleTasks?: DbScheduleTask[];
}

/**
 * Episode-specific layout for podcast and episode pages
 * Provides consistent structure: Header → Content → Chapters → Contact → Footer
 *
 * FIXES:
 * - Removes overflow-x-hidden (causes layout issues)
 * - All child components now have max-w-[1440px] constraint
 * - Responsive padding on all sections
 * - No absolute positioning at container level
 * - Footer wraps content properly without overflow
 */
export const EpisodeLayout = ({
  edition = "dubai",
  children,
  showChapters = true,
  showContact = true,
  showFooter = true,
  className = "",
  schedule,
  scheduleTasks,
}: EpisodeLayoutProps): JSX.Element => {
  return (
    <main className="flex flex-col items-center relative bg-white w-full overflow-x-clip">
      {/* Header - Consistent across all pages */}
      <GlobalHeader />

      <div className="w-full overflow-x-clip">
        {/* Main Content Area - Constrained width, responsive padding */}
        {children && (
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
            <div className={className}>{children}</div>
          </div>
        )}

        {/* Chapters Section - Optional, shown by default - Full width without wrapper */}
        {showChapters && edition && <TheThreeChaptersSection edition={edition} schedule={schedule} scheduleTasks={scheduleTasks} />}
      </div>

      {/* Contact Section - Optional, shown by default */}
      {showContact && <AboutUsSection />}

      {/* Footer - Optional, shown by default */}
      {showFooter && <FooterSection />}
    </main>
  );
};

export type { EditionType };

import {
  GlobalHeader,
  AboutUsSection,
  FooterSection,
} from "../components";
import { TheThreeChaptersSection } from "../features/podcasts";
import SEO from "../components/common/SEO";
import { useState, useEffect } from "react";
import { fetchEditions, DbEdition } from "../services/api/client";

const createEditionSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+edition\s*/gi, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

/**
 * Schedule Page - Fully Responsive
 * Now uses unified components matching mobile web design exactly
 * - GlobalHeader for consistent navigation
 * - TheThreeChaptersSection for Singapore Edition
 * - TheThreeChaptersSection for Dubai Edition
 * - ContactUsSection for About Us
 * - FooterSection for copyright footer
 */
export const SchedulePage = (): JSX.Element => {
  const [dbEditions, setDbEditions] = useState<DbEdition[]>([]);

  useEffect(() => {
    const loadEditions = async () => {
      try {
        const editions = await fetchEditions();
        setDbEditions(editions.filter(e => e.status === 'live'));
      } catch (error) {
        console.error("Failed to load editions:", error);
      }
    };
    loadEditions();
  }, []);

  return (
    <>
      <SEO
        title="Be a Guest - Share Your Leadership Story | Talent Unwrapped"
        description="Join Talent Unwrapped podcast as a guest speaker. Share your leadership journey, insights on innovation, and perspectives on the future of work with our global audience."
        keywords="podcast guest, leadership speaker, be a podcast guest, share leadership story, talent unwrapped guest, innovation speaker"
        url="/schedule"
      />
      <main className="flex flex-col items-center relative bg-white w-full overflow-x-clip">
        {/* Header - Consistent across all pages */}
        <GlobalHeader />

        {/* Main Content - Constrained width, responsive padding */}
        <div className="w-full overflow-x-clip">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
            {/* Singapore Edition - Three Chapters */}
            <TheThreeChaptersSection edition="singapore" />

            {/* Dubai Edition - Three Chapters */}
            <TheThreeChaptersSection edition="dubai" hideTopSection={true} />

            {/* DB Editions - Three Chapters */}
            {dbEditions.map((edition) => {
              const editionImages = edition.image_url ? (() => {
                try {
                  const parsed = JSON.parse(edition.image_url);
                  return Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                  return [edition.image_url];
                }
              })() : [];
              
              return (
                <TheThreeChaptersSection 
                  key={edition.id} 
                  edition={createEditionSlug(edition.name) as any} 
                  hideTopSection={true}
                  dbEditionId={edition.id}
                  dbEditionName={edition.location || edition.name}
                  editionImages={editionImages}
                />
              );
            })}
          </div>
        </div>

        {/* About Us Section */}
        <AboutUsSection />

        {/* Footer */}
        <FooterSection />
      </main>
    </>
  );
};

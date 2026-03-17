import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants";
import { ChevronDownIcon } from "@/components/common/Icons";
import { NAV_LABELS, EDITION_NAMES } from "@/constants/copy";
import { fetchEditions, DbEdition } from "@/services/api/client";

interface Edition {
  name: string;
  path: string;
  flag: string;
  isDbEdition?: boolean;
}

const createEditionSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+edition\s*/gi, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

export const EditionsDropdown = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dbEditions, setDbEditions] = useState<DbEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const hardcodedEditions: Edition[] = [
    {
      name: `${EDITION_NAMES.SINGAPORE} Edition`,
      path: ROUTES.SINGAPORE,
      flag: "🇸🇬",
    },
    {
      name: `${EDITION_NAMES.DUBAI} Edition`,
      path: ROUTES.DUBAI,
      flag: "🇦🇪",
    },
    {
      name: `${EDITION_NAMES.SRI_LANKA} Edition`,
      path: ROUTES.SRI_LANKA,
      flag: "🇱🇰",
    },
  ];

  // Fetch DB editions
  useEffect(() => {
    const loadDbEditions = async () => {
      try {
        const editions = await fetchEditions();
        setDbEditions(editions);
      } catch (error) {
        console.error('Failed to load DB editions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDbEditions();
  }, []);

  // Convert DB editions to Edition format
  const dbEditionItems: Edition[] = dbEditions.map((edition) => ({
    name: edition.name,
    path: `/edition/${createEditionSlug(edition.name)}`,
    flag: "🎯",
    isDbEdition: true,
  }));

  // Combine hardcoded and DB editions
  const editions: Edition[] = [...hardcodedEditions, ...dbEditionItems];

  const currentEdition = editions.find(
    (edition) => edition.path === location.pathname,
  );
  const isLandingPage = location.pathname === "/" || !currentEdition;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleEditionSelect = (edition: Edition) => {
    navigate(edition.path);
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // 300ms buffer to close
  };

  return (
    <div
      className="relative inline-block"
      ref={dropdownRef}
      onMouseEnter={!isMobile ? handleMouseEnter : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-end justify-center gap-2.5 px-4 relative flex-[0_0_auto] glass-button rounded-md transition-all duration-300 group border-none bg-transparent mt-[-1.00px] pb-1 touch-manipulation"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="relative flex items-end justify-center w-fit [font-family:'Geist',Helvetica] font-normal text-[#232323] text-base text-center tracking-[-0.32px] leading-6 whitespace-nowrap group-hover:text-[#7bb302] transition-colors duration-300">
          {isLandingPage ? NAV_LABELS.EDITIONS : currentEdition?.name || NAV_LABELS.EDITIONS}
        </span>
        <ChevronDownIcon
          className={`relative w-4 h-4 mr-0 transition-transform duration-300 self-center ${isOpen ? "rotate-180" : ""}`}
          color="currentColor"
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[102] animate-fade-in max-h-96 overflow-y-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              Loading editions...
            </div>
          ) : (
            <>
              {editions.map((edition) => (
                <button
                  key={edition.path}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditionSelect(edition);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 flex items-center gap-3 touch-manipulation ${currentEdition?.path === edition.path
                    ? "bg-green-50 text-[#7bb302]"
                    : "text-[#232323]"
                    }`}
                >
                  <span className="text-lg transition-transform duration-200 hover:scale-125">
                    {edition.flag}
                  </span>
                  <div className="flex flex-col flex-1">
                    <span className="[font-family:'Geist',Helvetica] font-medium text-sm">
                      {edition.name}
                    </span>
                    {edition.isDbEdition && (
                      <span className="[font-family:'Geist',Helvetica] font-normal text-xs text-gray-400">
                        New
                      </span>
                    )}
                    {currentEdition?.path === edition.path && (
                      <span className="[font-family:'Geist',Helvetica] font-normal text-xs text-[#7bb302]">
                        {NAV_LABELS.CURRENT}
                      </span>
                    )}
                  </div>
                  {currentEdition?.path === edition.path && (
                    <div className="ml-auto w-2 h-2 bg-[#7bb302] rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

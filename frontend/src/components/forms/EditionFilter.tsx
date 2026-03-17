import { useState, useEffect } from "react";
import { DbEdition } from "../../services/api/client";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/common/Icons";

const createEditionSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+edition\s*/gi, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

interface EditionFilterProps {
  selectedEdition: string;
  onEditionChange: (edition: string) => void;
  dbEditions?: DbEdition[];
}

export const EditionFilter = ({
  selectedEdition,
  onEditionChange,
  dbEditions = [],
}: EditionFilterProps): JSX.Element => {
  const allEditions = [
    { id: "singapore", name: "Singapore", flag: "🇸🇬" },
    { id: "dubai", name: "Dubai", flag: "🇦🇪" },
    { id: "sri-lanka", name: "Sri Lanka", flag: "🇱🇰" },
    ...dbEditions.map(e => ({ id: createEditionSlug(e.name), name: e.name, flag: "🎯" }))
  ];

  const currentIndex = allEditions.findIndex(e => e.id === selectedEdition);
  const [activeIndex, setActiveIndex] = useState(currentIndex >= 0 ? currentIndex : 0);

  useEffect(() => {
    const idx = allEditions.findIndex(e => e.id === selectedEdition);
    if (idx >= 0) setActiveIndex(idx);
  }, [selectedEdition]);

  const goLeft = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : allEditions.length - 1;
    setActiveIndex(newIndex);
    onEditionChange(allEditions[newIndex].id);
  };

  const goRight = () => {
    const newIndex = activeIndex < allEditions.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
    onEditionChange(allEditions[newIndex].id);
  };

  const currentEdition = allEditions[activeIndex];

  return (
    <div className="inline-flex items-center gap-3 bg-white rounded-full p-2 shadow-sm border border-gray-200">
      {/* Left Arrow */}
      <button
        onClick={goLeft}
        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
        aria-label="Previous edition"
      >
        <ChevronLeftIcon size={24} />
      </button>

      {/* Current Edition */}
      <button
        onClick={() => onEditionChange(currentEdition.id)}
        className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-[#7bb302] text-white min-w-[120px]"
        aria-pressed="true"
      >
        {currentEdition.flag} {currentEdition.name}
      </button>

      {/* Right Arrow */}
      <button
        onClick={goRight}
        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
        aria-label="Next edition"
      >
        <ChevronRightIcon size={24} />
      </button>
    </div>
  );
};

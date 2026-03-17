import type { Episode } from "../types";

// Edition-specific content structure
export const EDITION_CONTENT = {
  singapore: {
    name: "Singapore",
    schedule: {
      date: "12th, 13th Nov 2025",
      dateTime: "2025-11-12",
    },
    chapters: [
      {
        id: 1,
        title: "Leadership Reimagined: ",
        subtitle:
          "Building Mental Toughness, Culture, and Agility for the Future of Work",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
      {
        id: 2,
        title: "Beyond Resilience: ",
        subtitle: "Redefining Leadership Strength and Organizational Agility",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
      {
        id: 3,
        title: "The Human Blueprint: ",
        subtitle: "Rethinking Leadership for an Intelligent Age",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
    ],
  },
  dubai: {
    name: "Dubai",
    schedule: {
      date: "15th, 16th Dec 2025",
      dateTime: "2025-12-15",
    },
    chapters: [
      {
        id: 1,
        title: "Innovation in Leadership: ",
        subtitle: "Transforming Business Culture in the Middle East",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
      {
        id: 2,
        title: "Digital Transformation: ",
        subtitle: "Leading Change in a Rapidly Evolving Landscape",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
      {
        id: 3,
        title: "Global Vision: ",
        subtitle: "Building Bridges Between East and West",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
    ],
  },
  "sri-lanka": {
    name: "Sri Lanka",
    schedule: {
      date: "1st Sep 2025",
      dateTime: "2025-09-01",
    },
    chapters: [
      {
        id: 1,
        title: "Resilient Leadership: ",
        subtitle: "Navigating Challenges and Seizing Opportunities in South Asia",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
      {
        id: 2,
        title: "Talent Evolution: ",
        subtitle: "Future-Proofing the Workforce for a Global Economy",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
      {
        id: 3,
        title: "Global Connectivity: ",
        subtitle: "Integrating Local Talent with Global Markets",
        videoIcon: "videoCircle",
        exportIcon: "export",
      },
    ],
  },
};

// Legacy export for backwards compatibility
export const THREE_CHAPTERS: Episode[] = EDITION_CONTENT.singapore.chapters;

// Position map for layout adjustments by edition
export const POSITION_MAP = {
  dubai: {
    header: "lg:left-[80px]",
    viewersCount: "lg:left-[80px]",
    description: "lg:left-[500px]",
    button: "lg:left-[500px]",
    cards: "lg:left-[80px]",
  },
  singapore: {
    header: "lg:left-[80px]",
    viewersCount: "lg:left-[80px]",
    description: "lg:left-[500px]",
    button: "lg:left-[500px]",
    cards: "lg:left-[80px]",
  },
  "sri-lanka": {
    header: "lg:left-[80px]",
    viewersCount: "lg:left-[80px]",
    description: "lg:left-[500px]",
    button: "lg:left-[500px]",
    cards: "lg:left-[80px]",
  },
};

export const getThreeChapters = (): Episode[] => THREE_CHAPTERS;

export const getPositionsByEdition = (
  edition: "dubai" | "singapore" | "sri-lanka",
): typeof POSITION_MAP.dubai => {
  return POSITION_MAP[edition as keyof typeof POSITION_MAP] || POSITION_MAP.singapore;
};

export const getEditionName = (edition: "dubai" | "singapore" | "sri-lanka"): string => {
  if (edition === "dubai") return "Dubai Edition";
  if (edition === "sri-lanka") return "Sri Lanka Edition";
  return "Singapore Edition";
};

export const getEditionContent = (edition: "dubai" | "singapore" | "sri-lanka") => {
  return EDITION_CONTENT[edition as keyof typeof EDITION_CONTENT] || EDITION_CONTENT.singapore;
};

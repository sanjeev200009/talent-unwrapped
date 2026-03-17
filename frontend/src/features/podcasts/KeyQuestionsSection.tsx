import { useState } from "react";
import {
  getSessionContentByEdition,
  AYIN_SHAH_JAHAN_CUSTOM_CONTENT,
  SUMUDU_THANTHIRIGODA_CUSTOM_CONTENT,
  SURANI_AMARASINGHE_CUSTOM_CONTENT,
  ASHAN_RANSILIGE_CUSTOM_CONTENT,
  INOKA_DIAS_CUSTOM_CONTENT,
  KARTHIK_BADRINATH_CUSTOM_CONTENT
} from "@/data/episodeDetails";
import { VideoCircleFilledIcon, ExportIcon } from "@/components/common/Icons";
import { SECTION_TITLES, FORMS_CONTENT } from "@/constants/copy";
import type { EpisodeSpeaker } from "@/types";

interface KeyQuestionsSectionProps {
  edition?: "dubai" | "singapore" | "sri-lanka";
  episodeId?: string | number;
  speakers?: EpisodeSpeaker[];
}

export const KeyQuestionsSection = ({ edition = "dubai", episodeId, speakers }: KeyQuestionsSectionProps): JSX.Element => {
  const [currentPage] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<{
    [key: number]: number;
  }>({
    0: 0, // Expert 0 showing question 0
    1: 0, // Expert 1 showing question 0
    2: 0, // Expert 2 showing question 0
  });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const SPEAKER_CUSTOM_CONTENT_MAP: Record<string, typeof AYIN_SHAH_JAHAN_CUSTOM_CONTENT> = {
    "Ayin Shah Jahan": AYIN_SHAH_JAHAN_CUSTOM_CONTENT,
    "Sumudu Thanthirigoda": SUMUDU_THANTHIRIGODA_CUSTOM_CONTENT,
    "Surani Amarasinghe": SURANI_AMARASINGHE_CUSTOM_CONTENT,
    "Ashan Ransilige": ASHAN_RANSILIGE_CUSTOM_CONTENT,
    "Inoka Dias": INOKA_DIAS_CUSTOM_CONTENT,
    "Karthik Badrinath": KARTHIK_BADRINATH_CUSTOM_CONTENT,
  };

  // Check if speakers have questions from DB
  const hasDbQuestions = speakers && speakers.length > 0 && speakers.some(s => s.questions && s.questions.length > 0);

  // Create session from DB questions
  const createDbQuestionsSession = () => {
    if (!speakers || speakers.length === 0) return null;

    const experts = speakers.map((speaker, index) => ({
      profile: {
        id: `speaker-${index}`,
        name: speaker.name,
        title: speaker.role || "",
        subtitle: "",
        linkedin: speaker.linkedinUrl || "",
        imageUrl: speaker.avatar,
      },
      questions: (speaker.questions || []).map(q => ({ q, answer: "" })),
    }));

    return {
      ...baseContent[0],
      experts,
    };
  };

  // Get base content
  const baseContent = getSessionContentByEdition(edition);
  let currentSession = baseContent[currentPage];

  // Priority: 1. DB questions, 2. Hardcoded speaker content, 3. Generic edition content
  if (hasDbQuestions) {
    const dbSession = createDbQuestionsSession();
    if (dbSession) {
      currentSession = dbSession;
    }
  } else {
    // Helper to create custom session
    const createCustomSession = (content: typeof AYIN_SHAH_JAHAN_CUSTOM_CONTENT) => {
      const customExpert = {
        profile: {
          id: `${content.expertName.toLowerCase().replace(/\s+/g, '-')}-custom`,
          name: content.expertName,
          title: content.expertTitle,
          subtitle: content.expertSubtitle,
          linkedin: content.linkedin,
          imageUrl: content.imageUrl,
        },
        questions: content.questions,
      };
      return {
        ...currentSession,
        experts: [customExpert],
      };
    };

    // Check for matching speaker by name in hardcoded content
    const epId = String(episodeId);
    if (epId === "3") {
      currentSession = createCustomSession(AYIN_SHAH_JAHAN_CUSTOM_CONTENT);
    } else if (epId === "4") {
      currentSession = createCustomSession(SUMUDU_THANTHIRIGODA_CUSTOM_CONTENT);
    } else if (epId === "5") {
      currentSession = createCustomSession(SURANI_AMARASINGHE_CUSTOM_CONTENT);
    } else if (epId === "6") {
      currentSession = createCustomSession(ASHAN_RANSILIGE_CUSTOM_CONTENT);
    } else if (epId === "7") {
      currentSession = createCustomSession(INOKA_DIAS_CUSTOM_CONTENT);
    } else if (epId === "8") {
      currentSession = createCustomSession(KARTHIK_BADRINATH_CUSTOM_CONTENT);
    }
  }

  const hasCustomContent = hasDbQuestions || (episodeId && ["3", "4", "5", "6", "7", "8"].includes(String(episodeId)));

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (expertIndex: number, totalQuestions: number) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - go to next question
      setActiveQuestionIndex((prev) => ({
        ...prev,
        [expertIndex]: (prev[expertIndex] + 1) % totalQuestions,
      }));
    } else if (isRightSwipe) {
      // Swipe right - go to previous question
      setActiveQuestionIndex((prev) => ({
        ...prev,
        [expertIndex]:
          (prev[expertIndex] - 1 + totalQuestions) % totalQuestions,
      }));
    }
  };

  return (
    <section className="relative w-full bg-white py-10 sm:py-12 md:py-16 lg:py-[60px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="max-w-[1320px] mx-auto w-full">
        {/* Header Badge and Title */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2.5 p-3 bg-[#7bb302] rounded-[40px]">
              <VideoCircleFilledIcon
                className="text-white"
                size={24}
              />
            </div>
            <h2 className="[font-family:'Geist',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[42px] tracking-[-0.8px] lg:tracking-[-1.68px] leading-tight lg:leading-[60px]">
              <span className="text-[#7cb403]">{SECTION_TITLES.KEY_QUESTIONS} </span>
              <span className="text-[#ed2939]">{SECTION_TITLES.DISCUSSED}</span>
            </h2>
          </div>
        </div>

        {/* Animated Content Container */}
        <div className="transition-all duration-500 ease-in-out">
          {/* Session Title with Border */}
          <div className="flex items-center gap-4 pb-4 mb-6 border-b border-neutral-200">
            <h3 className="flex-1 [font-family:'Geist',Helvetica] font-medium text-xl sm:text-2xl md:text-[29px] tracking-[-0.8px] lg:tracking-[-1.16px] leading-tight">
              <span className="text-[#7bb302]">
                {currentSession.sessionTitle}
              </span>
              <span className="text-[#ed2939]">
                {currentSession.sessionSubtitle}
              </span>
            </h3>
            <button
              type="button"
              aria-label="Export session"
              className="flex-shrink-0 w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
            >
              <ExportIcon className="w-full h-full text-[#7bb302]" />
            </button>
          </div>

          {/* Session Description - Hidden for Dubai as requested, and also hidden for customized episodes */}
          {edition !== "dubai" && !hasCustomContent && (
            <div className="mb-8 sm:mb-10">
              <p className="[font-family:'Geist',Helvetica] font-normal text-[#8d8d8d] text-base sm:text-lg md:text-xl leading-relaxed mb-4 sm:mb-5">
                {currentSession.sessionDescription}
              </p>

              <div className="space-y-4">
                <h4 className="[font-family:'Geist',Helvetica] font-bold text-[#8d8d8d] text-base sm:text-lg md:text-xl leading-relaxed">
                  {FORMS_CONTENT.LEADERSHIP_MEANING}
                </h4>

                <p className="[font-family:'Geist',Helvetica] font-normal text-[#8d8d8d] text-base sm:text-lg md:text-xl leading-relaxed">
                  {FORMS_CONTENT.TODAYS_LEADERS}
                </p>

                <ul className="[font-family:'Geist',Helvetica] font-normal text-[#8d8d8d] text-base sm:text-lg md:text-xl leading-relaxed space-y-3 pl-6">
                  {currentSession.sessionPoints.map((point, index) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Expert Profiles with Questions - Mobile Card Design */}
          <div className="space-y-4 md:space-y-16">
            {currentSession.experts.map((expert, expertIndex) => {
              const currentQuestionIndex =
                activeQuestionIndex[expertIndex] || 0;
              const currentQuestion = expert.questions[currentQuestionIndex];

              return (
                <div key={expertIndex}>
                  {/* Mobile Card Layout - Single Card with Slider */}
                  <div className="md:hidden">
                    <div
                      className="bg-[#f8f8f8] rounded-[25px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-[15px] pt-[30px] pb-[50px] relative touch-pan-y"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={() =>
                        handleTouchEnd(expertIndex, expert.questions.length)
                      }
                    >
                      {/* Speaker Info */}
                      <div className="flex items-start gap-4 mb-[42px]">
                        {/* Profile Image */}
                        <div className="w-[108px] h-[108px] flex-shrink-0 bg-[rgba(0,0,0,0.2)] rounded-full overflow-hidden border-[3.6px] border-solid border-white">
                          <img
                            className="w-full h-full object-cover"
                            alt={expert.profile.name}
                            src={expert.profile.imageUrl}
                          />
                        </div>

                        {/* Speaker Details */}
                        <div className="flex flex-col pt-2">
                          <p className="[font-family:'Geist',Helvetica] font-medium text-[#232323] text-[15.426px] tracking-[-0.617px] leading-normal mb-0">
                            {expert.profile.name}
                          </p>
                          <p className="[font-family:'Geist',Helvetica] font-normal text-[#939393] text-[15.426px] leading-normal mb-0">
                            {expert.profile.title}
                          </p>
                          {expert.profile.subtitle && (
                            <p className="[font-family:'Geist',Helvetica] font-normal text-[#939393] text-[15.426px] leading-normal mb-0">
                              {expert.profile.subtitle}
                            </p>
                          )}
                          <a
                            href={expert.profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="[font-family:'Geist',Helvetica] font-extralight text-[#939393] text-[15.426px] leading-normal hover:text-[#7bb302] transition-colors mt-1 break-all"
                          >
                            {expert.profile.linkedin}
                          </a>
                        </div>
                      </div>

                      {/* Question - Shows current question based on slider */}
                      <div className="mb-4 min-h-[124px] transition-all duration-300">
                        <p className="[font-family:'Geist',Helvetica] text-[19px] leading-normal tracking-[-0.38px] m-0 mb-3">
                          <span className="font-bold text-[#ed2939]">
                            Q{currentQuestionIndex + 1} -{" "}
                          </span>
                          <span className="font-light text-[#232323]">
                            {currentQuestion.q}
                          </span>
                        </p>
                        {/* Display Answer on Mobile */}
                        {currentQuestion.answer && (
                          <div className="pl-4 border-l-2 border-[#ed2939]/20">
                            <p className="[font-family:'Geist',Helvetica] text-base leading-relaxed text-[#555] font-light">
                              {currentQuestion.answer}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Slide Indicator - Clickable to switch questions */}
                      <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 flex items-center gap-[6px]">
                        {expert.questions.map((_, dotIndex) => (
                          <button
                            key={dotIndex}
                            onClick={() =>
                              setActiveQuestionIndex((prev) => ({
                                ...prev,
                                [expertIndex]: dotIndex,
                              }))
                            }
                            className={`rounded-full transition-all cursor-pointer border-none ${dotIndex === currentQuestionIndex
                              ? "w-[8px] h-[8px] bg-[#7bb302]"
                              : "w-[6px] h-[6px] bg-[#d9d9d9]"
                              }`}
                            aria-label={`Show question ${dotIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex flex-row gap-6 sm:gap-8 items-start">
                    <div className="flex items-start gap-4 flex-shrink-0 w-[280px]">
                      <div className="w-[60px] h-[60px] flex justify-center bg-[#00000033] rounded-full overflow-hidden border-2 border-solid border-white flex-shrink-0">
                        <img
                          className="w-full h-full object-cover"
                          alt={expert.profile.name}
                          src={expert.profile.imageUrl}
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="[font-family:'Geist',Helvetica] font-medium text-[#222223] text-base sm:text-lg tracking-[-0.14px] leading-tight">
                          {expert.profile.name}
                        </p>
                        <p className="[font-family:'Geist',Helvetica] font-normal text-[#939393] text-sm sm:text-base tracking-[-0.14px] leading-tight">
                          {expert.profile.title}
                          {expert.profile.subtitle && (
                            <>
                              <br />
                              {expert.profile.subtitle}
                            </>
                          )}
                        </p>
                        <a
                          href={expert.profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="[font-family:'Geist',Helvetica] font-light text-[#939393] text-xs sm:text-sm tracking-[-0.14px] leading-tight hover:text-[#7bb302] transition-colors mt-1"
                        >
                          {FORMS_CONTENT.LINKEDIN_PROFILE}
                        </a>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6 pl-6 border-l border-neutral-200">
                      {expert.questions.map((question, qIndex) => (
                        <div key={qIndex}>
                          <p className="[font-family:'Geist',Helvetica] text-base sm:text-lg md:text-[19px] leading-relaxed mb-2">
                            <span className="font-bold text-[#ed2939]">
                              Q{qIndex + 1} -{" "}
                            </span>
                            <span className="font-light text-[#222223]">
                              {question.q}
                            </span>
                          </p>
                          {/* Display Answer on Desktop */}
                          {question.answer && (
                            <div className="pl-8 sm:pl-10">
                              <p className="[font-family:'Geist',Helvetica] text-base leading-relaxed text-[#555] font-light italic">
                                {question.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

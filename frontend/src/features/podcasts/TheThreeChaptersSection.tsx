import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { TheThreeChaptersSectionProps } from "../../types";
import { getEditionContent } from "../../data";
import { MobileCarouselSection } from "@/components";
import { LearnMoreModal } from "../schedule";
import { ASSETS } from "@/constants/assets";
import { ArrowRightIcon, VideoCircleFilledIcon, ExportIcon } from "@/components/common/Icons";
import { SECTION_TITLES, SECTION_DESCRIPTIONS, BUTTONS, TALENT_INTRO_CONTENT } from "@/constants/copy";
import { fetchScheduleWithTasks, DbSchedule, DbScheduleTask } from "../../services/api/client";

const Counter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, {
        duration: 2,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [inView, count, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

/**
 * Format date from DB format to display format
 */
const formatScheduleDate = (startDate: string, endDate?: string): { date: string; dateTime: string } => {
  const start = new Date(startDate);
  const startDay = start.getDate();
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startYear = start.getFullYear();
  
  if (endDate) {
    const end = new Date(endDate);
    const endDay = end.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return {
        date: `${startDay}-${endDay} ${endMonth} ${startYear}`,
        dateTime: startDate
      };
    }
    return {
      date: `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`,
      dateTime: startDate
    };
  }
  
  return {
    date: `${startDay}${getOrdinalSuffix(startDay)} ${startMonth} ${startYear}`,
    dateTime: startDate
  };
};

const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

/**
 * TheThreeChaptersSection - Complete section
 * Shows specific edition content without filter
 */
export const TheThreeChaptersSection = ({
  edition = "singapore",
  hideTopSection = false,
  schedule: dbSchedule,
  scheduleTasks = [],
  dbEditionId,
  dbEditionName,
}: TheThreeChaptersSectionProps): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localDbSchedule, setLocalDbSchedule] = useState<DbSchedule | null>(dbSchedule || null);
  const [localScheduleTasks, setLocalScheduleTasks] = useState<DbScheduleTask[]>(scheduleTasks);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch schedule/tasks if dbEditionId is provided
  useEffect(() => {
    if (dbEditionId) {
      const fetchSchedule = async () => {
        try {
          const { schedule, tasks } = await fetchScheduleWithTasks(dbEditionId);
          setLocalDbSchedule(schedule);
          setLocalScheduleTasks(tasks);
        } catch (error) {
          console.error("Failed to fetch schedule:", error);
        }
      };
      fetchSchedule();
    }
  }, [dbEditionId]);

  const editionData = getEditionContent(edition);
  const { name: hardcodedEditionName, schedule: hardcodedSchedule, chapters } = editionData;

  // Use DB edition name if provided, otherwise use hardcoded
  const editionName = dbEditionName || hardcodedEditionName;

  // Use DB schedule tasks if provided, otherwise use hardcoded chapters
  const displayChapters = (localDbSchedule && localScheduleTasks.length > 0) || dbEditionId
    ? localScheduleTasks.map((task, index) => ({
        id: index + 1,
        title: task.title,
        subtitle: task.description || "",
        videoIcon: "videoCircle",
        exportIcon: "export",
      }))
    : chapters;

  // Use DB schedule if provided, otherwise use hardcoded
  const schedule = (localDbSchedule && localDbSchedule.start_date) || dbEditionId
    ? formatScheduleDate(localDbSchedule?.start_date || '', localDbSchedule?.end_date)
    : hardcodedSchedule;

  const decorativeImages = [
    {
      id: 1,
      src: edition === "singapore"
        ? "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770709852/Unwrapped_thumbnail_-_Ella_2_r6uwdx.png"
        : edition === "sri-lanka"
          ? "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1771218003/1764928872339_j91re3.jpg"
          : ASSETS.manInHeadphones,
      alt: edition === "singapore" ? "Ella Sherman" : edition === "sri-lanka" ? "Sumudu Thanthirigoda" : "Man in headphones",
      containerClass: `absolute ${isMobile ? "top-[260px] left-[10px]" : "top-[260px] lg:top-[170px] left-[5%] lg:left-[871px]"} w-[100px] h-[75px] lg:w-[152px] lg:h-[114px] z-0 lg:flex rounded-xl overflow-hidden shadow-[12px_12px_30px_#00000017] opacity-80 lg:opacity-100`,
      baseRotate: -7.30,
      objectPosition: (edition === "singapore" || edition === "sri-lanka") ? "center center" : undefined,
      imageScale: edition === "singapore" ? (isMobile ? 1.05 : 1.1) : edition === "sri-lanka" ? (isMobile ? 1.05 : 1.1) : (isMobile ? 1.8 : 2.2),
      imageTranslateX: (edition === "singapore" || edition === "sri-lanka") ? "0px" : (isMobile ? "20px" : "40px"),
      imageTranslateY: (edition === "singapore") ? "0px" : edition === "sri-lanka" ? (isMobile ? "10px" : "15px") : (isMobile ? "10px" : "25px"),
      animY: isMobile ? [0, -8, 0] : [0, -15, 0],
    },
    {
      id: 2,
      src: edition === "singapore"
        ? "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770709853/Unwrapped_thumbnail_-_Echo_1_g0i2ae.png"
        : edition === "sri-lanka"
          ? "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770883420/Frame_4449057_1_1_npu1wb.png"
          : ASSETS.youngBlackMan,
      alt: edition === "singapore" ? "Avik Ghosh" : edition === "sri-lanka" ? "Ayin Shah Jahan" : "Young black man in headphones",
      containerClass: `absolute ${isMobile ? "top-[20px] right-[40px]" : "top-[140px] sm:left-[230px] lg:left-[1125px] right-[5%] lg:right-auto"} w-[110px] h-[83px] lg:w-[152px] lg:h-[114px] z-0 lg:flex rounded-xl overflow-hidden shadow-[12px_12px_30px_#00000017] opacity-80 lg:opacity-100`,
      baseRotate: 6.49,
      objectPosition: (edition === "singapore" || edition === "sri-lanka") ? "center center" : undefined,
      imageScale: edition === "singapore" ? (isMobile ? 1.05 : 1.1) : edition === "sri-lanka" ? (isMobile ? 1.05 : 1.1) : (isMobile ? 1.8 : 2.2),
      imageTranslateX: (edition === "singapore" || edition === "sri-lanka") ? "0px" : (isMobile ? "20px" : "40px"),
      imageTranslateY: (edition === "singapore") ? "0px" : edition === "sri-lanka" ? (isMobile ? "10px" : "15px") : (isMobile ? "10px" : "25px"),
      animY: isMobile ? [0, -8, 0] : [0, -15, 0],
    },
  ];

  const getCounterRotation = (baseRotate: number) => ({
    rotate: [(-baseRotate - 4), (-(baseRotate + 2) - 4), (-baseRotate - 4)],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      className="relative w-full max-w-[1440px] bg-white mx-auto overflow-hidden"
      style={{
        paddingLeft: "clamp(16px, 4vw, 120px)",
        paddingRight: "clamp(16px, 4vw, 120px)",
        paddingTop: "clamp(8px, 1vw, 20px)",
        paddingBottom: "clamp(8px, 1vw, 20px)",
        marginTop: "40px",
        marginBottom: "0px",
        minHeight: "clamp(400px, 50vh, 600px)",
      }}
    >
      <div
        className={hideTopSection ? "lg:h-auto" : "lg:h-auto lg:min-h-[900px]"}
      >
        {/* Main Content Layout - Responsive Grid for Tablet, Absolute for Desktop */}
        <div
          className={`relative z-10 flex flex-col md:grid md:grid-cols-12 lg:block ${hideTopSection ? "" : "gap-8 lg:gap-0"}`}
        >
          {!hideTopSection && (
            <>
              <div className="md:col-span-4 lg:contents">
                <motion.header
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="relative lg:absolute top-0 lg:top-0 left-0 lg:left-[10px] w-full lg:w-[203px] text-left mb-4 md:mb-8 lg:mb-0 [font-family:'Geist',Helvetica] font-bold text-[#7bb302] text-[8px] md:text-sm tracking-[-0.32px] leading-[normal]"
                >
                  {SECTION_TITLES.THE_THREE_CHAPTERS}
                </motion.header>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="flex flex-col w-full lg:w-[203px] items-start gap-2 lg:gap-3 relative lg:absolute top-auto lg:top-[164px] left-0 lg:left-[10px] mb-4 md:mb-0"
                >
                  <div className="relative self-stretch mt-[-1.00px] [font-family:'Geist',Helvetica] font-medium text-[#232323] text-[30px] sm:text-[36px] md:text-[42px] lg:text-[50px] xl:text-[60px] tracking-[-0.03em] sm:tracking-[-0.04em] lg:tracking-[-0.05em] leading-[1.1] text-left">
                    <Counter value={100} suffix="K+" />
                  </div>

                  <div className="relative self-stretch [font-family:'Geist',Helvetica] font-normal text-[#8d8d8d] text-xs md:text-sm text-left tracking-[-0.32px] lg:tracking-[-0.64px] leading-[normal]">
                    {SECTION_DESCRIPTIONS.VIEWERS_WORLDWIDE}
                  </div>
                </motion.div>
              </div>

              <div className="md:col-span-8 lg:contents">
                <motion.p
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="relative lg:absolute top-auto lg:top-0 left-0 lg:left-[400px] w-full lg:w-[904px] max-w-full text-center lg:text-left mb-6 lg:mb-0 [font-family:'Geist',Helvetica] font-medium text-transparent text-[18px] sm:text-[22px] md:text-[28px] lg:text-[34px] xl:text-[40px] tracking-[-0.02em] sm:tracking-[-0.025em] lg:tracking-[-0.03em] leading-[1.3] sm:leading-[1.35] lg:leading-[1.4]"
                >
                  <span className="text-[#232323] tracking-[-0.77px]">
                    {TALENT_INTRO_CONTENT.CHAPTER_PREFIX} {editionName} Edition{" "}
                  </span>

                  <span className="text-[#8d8d8d] tracking-[-0.77px]">
                    {SECTION_DESCRIPTIONS.CHAPTER_EXPLORATION}
                  </span>
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="flex lg:block items-center justify-center lg:justify-start"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="relative lg:absolute top-auto lg:top-[258px] left-0 lg:left-[400px] inline-flex h-12 md:h-[54px] items-center justify-center gap-2 px-4 md:px-5 py-3 md:py-4 bg-[#7bb302] rounded-[60px] cursor-pointer hover:bg-[#6da002] transition-colors mb-4 md:mb-0 mx-auto lg:mx-0"
                    aria-label="More about the podcast"
                  >
                    <span className="relative w-fit mt-[-0.50px] [font-family:'Geist',Helvetica] font-semibold text-white text-sm md:text-base tracking-[-0.48px] leading-[normal]">
                      {BUTTONS.MORE_ABOUT_PODCAST}
                    </span>

                    <ArrowRightIcon className="text-white" size={24} />
                  </motion.button>
                </motion.div>
              </div>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={`flex flex-col w-full items-start gap-2 relative lg:absolute top-auto ${hideTopSection ? "lg:top-0" : "lg:top-[478px]"} left-0 lg:left-[120px] text-left ${hideTopSection ? "mt-0" : "mt-8 sm:mt-10 md:mt-12 lg:mt-0"} mb-6 lg:ml-0 pl-4 sm:pl-6 md:pl-8 lg:pl-0`}
        >
          <p className="relative w-full max-w-none lg:w-auto [font-family:'Geist',Helvetica] font-medium text-[20px] sm:text-[24px] md:text-[28px] lg:text-[36px] leading-[24px] sm:leading-[28px] md:leading-[32px] lg:leading-[42px] whitespace-normal lg:whitespace-nowrap">
            <span className="text-[#7cb403]">
              {TALENT_INTRO_CONTENT.SCHEDULE_FOR} {editionName} Edition{" "}
            </span>
            <time className="text-[#ed2939]" dateTime={schedule.dateTime}>
              {schedule.date}
            </time>
          </p>
        </motion.div>

        <div
          className={`flex flex-col lg:flex-row items-center justify-start gap-4 xl:gap-8 relative lg:absolute top-auto ${hideTopSection ? "lg:top-[60px]" : "lg:top-[589px]"} left-0 lg:left-[120px] w-full max-w-full scrollbar-hide pl-4 sm:pl-6 md:pl-8 lg:pl-0`}
        >
          {/* Mobile Carousel - Only visible on mobile */}
          <div className="lg:hidden w-full mb-8">
            <MobileCarouselSection
              podcastCards={displayChapters.map((ep) => ({
                id: Number(ep.id),
                title: ep.title,
                subtitle: ep.subtitle || "",
              }))}
              onLearnMore={() => setIsModalOpen(true)}
            />
          </div>

          {/* Desktop Cards - Only visible on lg+ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="hidden lg:flex gap-4 xl:gap-8 w-full lg:w-[95%] xl:w-auto justify-start"
          >
            {displayChapters.map((episode) => (
              <motion.article
                key={episode.id}
                variants={itemVariants}
                className="relative w-full max-w-[360px] lg:flex-1 lg:max-w-[380px] xl:w-[380px] h-[260px] lg:h-[280px] bg-[#f8f8f8] rounded-[20px] lg:rounded-[24px] transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className="inline-flex items-center gap-2 lg:gap-2.5 p-2 lg:p-3 absolute top-4 lg:top-6 left-4 lg:left-6 bg-[#7bb302] rounded-[40px]"
                  aria-label="Video content"
                >
                  <VideoCircleFilledIcon className="text-white" size={24} />
                </div>

                <div
                  className="flex flex-col w-[calc(100%-2rem)] lg:w-[340px] items-start justify-start gap-3 lg:gap-4 absolute top-16 lg:top-20 left-4 lg:left-6"
                  style={{ overflow: "hidden" }}
                >
                  <div className="flex items-center gap-2 lg:gap-2.5 pt-0 pb-2 lg:pb-3 px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-neutral-200">
                    <h3 className="relative w-full mt-[-1.00px] [font-family:'Geist',Helvetica] font-medium text-transparent text-base sm:text-lg lg:text-[22px] tracking-[-0.5px] lg:tracking-[-1.08px] leading-tight lg:leading-[normal]">
                      <span className="text-[#7bb302] tracking-[-0.29px]">
                        {episode.title}{" "}
                      </span>

                      <span className="text-[#ed2939] tracking-[-0.29px]">
                        {episode.subtitle}
                      </span>
                    </h3>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex h-[38px] items-center justify-center gap-2 px-6 bg-[#7bb302] rounded-[40px] cursor-pointer hover:bg-[#6da002] transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
                    aria-label={BUTTONS.LEARN_MORE}
                  >
                    <span className="[font-family:'Geist',Helvetica] font-semibold text-white text-sm tracking-[-0.4px] leading-[normal]">
                      {BUTTONS.LEARN_MORE}
                    </span>
                    <ArrowRightIcon className="text-white" size={18} />
                  </button>
                </div>

                <a
                  href="#"
                  className="absolute top-6 lg:top-9 right-4 lg:right-6 w-5 h-5 lg:w-6 lg:h-6"
                  aria-label={`External link for ${episode.title}`}
                >
                  <ExportIcon className="text-[#7bb302]" size={24} />
                </a>
              </motion.article>
            ))}
          </motion.div>
        </div>

        {/* Decorative Images */}
        {!hideTopSection &&
          decorativeImages.map((image) => (
            <motion.div
              key={image.id}
              className={`${image.containerClass} will-change-transform shadow-[12px_12px_30px_#00000017]`}
              aria-hidden="true"
              animate={{
                y: image.animY || [0, -15, 0],
                rotate: [image.baseRotate, image.baseRotate + 2, image.baseRotate],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                perspective: "1000px",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }}
            >
              <motion.img
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  scale: image.imageScale,
                  transformOrigin: 'center center',
                  objectPosition: image.objectPosition,
                  x: image.imageTranslateX,
                  y: image.imageTranslateY,
                }}
                alt={image.alt}
                src={image.src}
                animate={getCounterRotation(image.baseRotate)}
              />
            </motion.div>
          ))}

        <LearnMoreModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </section>
  );
};



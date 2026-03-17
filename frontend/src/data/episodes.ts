import type { Episode, Podcast } from "../types";
import { fetchDbEpisodes, fetchDbEpisodesByEdition, fetchEpisodeById } from "../services/api/client";

export const EPISODES: Episode[] = [
    {
        id: "1",
        image: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770693712/WhatsApp_Image_2026-02-10_at_7.20.05_AM_unwtyi.jpg",
        category: "EPISODE",
        title: "From HR to Business Impact | Building Future-Ready Talent in the GCC | Talent Unwrapped – Dubai",
        description: "Exploring how HR leaders in the GCC are transforming their function into a strategic business engine, building future-ready talent pipelines, and balancing efficiency with employee experience.",
        duration: "1 hour",
        date: "Dec 10, 2025",
        videoUrl: "https://www.youtube.com/embed/3xda4skYDlg",
        edition: "Dubai",
        featured: true,
        speakers: [
            {
                name: "Mohammed Haffejee",
                role: "AVP Senior HRBP",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770618640/1756292060602_1_df82j8.png",
                linkedinUrl: "https://www.linkedin.com/in/mohammed-haffejee-6b26543/",
            },
            {
                name: "Gargi Bannerjee",
                role: "VP HR",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770618639/1621657233961_1_helgwf.png",
                linkedinUrl: "https://www.linkedin.com/in/gargi-banerjee-strategichr/",
            },
            {
                name: "Franklyn Henriques",
                role: "Regional HR Director",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770618638/1545386579437_1_vl1nrk.png",
                linkedinUrl: "https://www.linkedin.com/in/franklyn-henriques-chartered-fcipd-339aa05/",
            },
        ],
    },
    {
        id: "2",
        image: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770693712/Frame_1000003689_1_pq4rv5.png",
        category: "EPISODE",
        title: "Beyond Resilience | Redefining Leadership Strength & Organizational Agility | Talent Unwrapped – Singapore",
        description: "Exploring how leaders in Singapore are moving beyond simple resilience to redefine organizational agility, thriving through change, and turning disruption into a strategic advantage.",
        duration: "1 hour",
        date: "Nov 1, 2025",
        videoUrl: "https://www.youtube.com/embed/3xda4skYDlg",
        edition: "Singapore",
        featured: true,
        speakers: [
            {
                name: "Echo Wu",
                role: "Leadership & Mental Toughness Expert",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770617937/1756292060602_1_5_arkico.png",
                linkedinUrl: "https://www.linkedin.com/in/echoleadership/",
            },
            {
                name: "Avik Ghosh",
                role: "Executive Director",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770617937/1621657233961_1_dbrjce.png",
                linkedinUrl: "https://www.linkedin.com/in/avikghosh/",
            },
            {
                name: "Ella Sherman",
                role: "Head of HR APAC",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770617937/1545386579437_1_rv6wmx.png",
                linkedinUrl: "https://www.linkedin.com/in/ella-sherman",
            },
        ],
    },
    {
        id: "3",
        image: "",
        category: "SPEECH",
        title: "Ayin Shah Jahan at Talent Suite Colombo 2025",
        description: "Location Talent Leader - EY GDS Sri Lanka addressing the Talent Suite Colombo 2025, exploring leadership and talent trends.",
        duration: "15 min",
        date: "Sep 1, 2025",
        videoUrl: "https://www.youtube.com/embed/WI_QCvUUfgw",
        edition: "Sri Lanka",
        speakers: [
            {
                name: "Ayin Shah Jahan",
                role: "Location Talent Leader - EY GDS",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770883420/Frame_4449057_1_1_npu1wb.png",
                linkedinUrl: "https://www.linkedin.com/search/results/people/?keywords=Ayin%20Shah%20Jahan",
            },
        ],
    },
    {
        id: "4",
        image: "",
        category: "SPEECH",
        title: "Sumudu Thanthirigoda at Talent Suite Colombo 2025",
        description: "CEO - Maliban Group, Milk and Agri, sharing perspectives on industry leadership and business growth.",
        duration: "20 min",
        date: "Sep 1, 2025",
        videoUrl: "https://www.youtube.com/embed/ZOVPQRmFpRw",
        edition: "Sri Lanka",
        speakers: [
            {
                name: "Sumudu Thanthirigoda",
                role: "CEO - Maliban Group",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1771218003/1764928872339_j91re3.jpg",
                linkedinUrl: "https://www.linkedin.com/search/results/people/?keywords=Sumudu%20Thanthirigoda",
            },
        ],
    },
    {
        id: "5",
        image: "",
        category: "SPEECH",
        title: "Surani Amarasinghe at Talent Suite Colombo 2025",
        description: "Director Country People Partnering - LSEG, discussing talent development and organizational culture.",
        duration: "18 min",
        date: "Sep 1, 2025",
        videoUrl: "https://www.youtube.com/embed/7qpLhKJr35o",
        edition: "Sri Lanka",
        speakers: [
            {
                name: "Surani Amarasinghe",
                role: "Director - LSEG",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770886780/Frame_4449056_1_hxhoao.png",
                linkedinUrl: "https://www.linkedin.com/search/results/people/?keywords=Surani%20Amarasinghe",
            },
        ],
    },
    {
        id: "6",
        image: "",
        category: "SPEECH",
        title: "Ashan Ransilige at Talent Suite Colombo 2025",
        description: "CEO - Link Natural Product (Pvt) Ltd, sharing insights on leadership and operational excellence.",
        duration: "12 min",
        date: "Sep 1, 2025",
        videoUrl: "https://www.youtube.com/embed/1K28-pJcTog",
        edition: "Sri Lanka",
        speakers: [
            {
                name: "Ashan Ransilige",
                role: "CEO - Link Natural Product",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770886856/Frame_4449055_1_tegt2m.png",
                linkedinUrl: "https://www.linkedin.com/search/results/people/?keywords=Ashan%20Ransilige",
            },
        ],
    },
    {
        id: "7",
        image: "",
        category: "SPEECH",
        title: "Inoka Dias at Talent Suite Colombo 2025",
        description: "Senior Director/Head of Human Resource - Virtusa, exploring HR transformation and future-ready talent.",
        duration: "14 min",
        date: "Sep 1, 2025",
        videoUrl: "https://www.youtube.com/embed/OyiMnI01fPE",
        edition: "Sri Lanka",
        speakers: [
            {
                name: "Inoka Dias",
                role: "Head of HR - Virtusa",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1770887023/Frame_4449058_1_qy12hi.png",
            },
        ],
    },
    {
        id: "8",
        image: "",
        category: "SPEECH",
        title: "Karthik Badrinath at Talent Suite Colombo 2025",
        description: "Head of Sales Development LinkedIn-India, presenting on talent networking and professional development.",
        duration: "25 min",
        date: "Sep 1, 2025",
        videoUrl: "https://www.youtube.com/embed/OcOCgypmiU4",
        edition: "Sri Lanka",
        speakers: [
            {
                name: "Karthik Badrinath",
                role: "Head of Sales Development - LinkedIn India",
                avatar: "https://res.cloudinary.com/dvhxc6y0z/image/upload/v1771217891/1756738002848_mxqtdy.jpg",
            },
        ],
    },
];

export const LATEST_PODCASTS: Podcast[] = EPISODES.map(ep => ({
    id: Number(ep.id),
    title: ep.title,
    edition: ep.edition === "Sri Lanka" ? "Sri Lanka Edition" : `${ep.edition} Edition`,
    date: ep.date || "",
    thumbnailUrl: ep.image || "",
    videoUrl: ep.videoUrl || "",
}));

export const getEpisodesByEdition = (edition: string): Episode[] => {
    const formattedEdition = edition.toLowerCase();
    if (formattedEdition === "dubai") return EPISODES.filter(ep => ep.edition === "Dubai");
    if (formattedEdition === "singapore") return EPISODES.filter(ep => ep.edition === "Singapore");
    if (formattedEdition === "sri-lanka" || formattedEdition === "colombo") return EPISODES.filter(ep => ep.edition === "Sri Lanka");
    return EPISODES;
};

export const getEpisodeById = (id: string | number): Episode | undefined => {
    return EPISODES.find(ep => ep.id === String(id));
};

/**
 * Get all episodes (hardcoded + DB merged)
 * Returns hardcoded episodes by default, DB episodes are fetched separately
 */
export async function getAllEpisodes(): Promise<Episode[]> {
    return EPISODES;
}

/**
 * Get episodes filtered by edition (hardcoded + DB merged)
 */
export async function getEpisodesByEditionMixed(edition: string): Promise<Episode[]> {
    const formattedEdition = edition.toLowerCase();
    
    const hardcodedFiltered = getEpisodesByEdition(formattedEdition);
    
    const dbEpisodes = await fetchDbEpisodesByEdition(formattedEdition);
    
    const dbFiltered = dbEpisodes.filter(ep => 
        ep.edition?.toLowerCase() === formattedEdition ||
        ep.edition?.toLowerCase().includes(formattedEdition)
    );
    
    return [...hardcodedFiltered, ...dbFiltered];
}

/**
 * Get all episodes with DB data merged in
 */
export async function getAllEpisodesMerged(): Promise<Episode[]> {
    const dbEpisodes = await fetchDbEpisodes();
    return [...EPISODES, ...dbEpisodes];
}

/**
 * Get episode by ID from either hardcoded or DB
 */
export async function getEpisodeByIdMixed(id: string | number): Promise<Episode | undefined> {
    const hardcodedEpisode = getEpisodeById(id);
    if (hardcodedEpisode) {
        return hardcodedEpisode;
    }
    
    const dbEpisode = await fetchEpisodeById(String(id));
    return dbEpisode || undefined;
}

import React, { useState, useEffect, useRef } from 'react';
import { Film, Mic, Video, ArrowLeft, Plus, ChevronDown, X, Loader2, MessageCircle, Trash2, Calendar, CheckSquare, SaveAll } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GuestSpeakerCard from './GuestSpeakerCard';
import type { GuestSpeaker } from './GuestSpeakerCard';
import PodcastReelCard from './PodcastReelCard';
import type { PodcastReel } from './PodcastReelCard';
import { editionsAPI, reelsAPI, episodesAPI, schedulesAPI, scheduleTasksAPI, uploadAPI } from '../lib/api';

interface QuestionWithId {
  id: string;
  text: string;
}

interface SpeakerWithQuestions extends GuestSpeaker {
  questions: QuestionWithId[];
}

interface EpisodeFormData {
  id?: string;
  title: string;
  description: string;
  youtube_url: string;
  duration: string;
  added_date: string;
  thumbnail_url: string;
  images: string[];
  speakers: SpeakerWithQuestions[];
  reels: PodcastReel[];
}

interface ScheduleTaskFormData {
  id?: string;
  title: string;
  description: string;
  task_date: string;
  task_time: string;
}

interface ScheduleFormData {
  id?: string;
  start_date: string;
  end_date: string;
  tasks: ScheduleTaskFormData[];
}

interface EditionFormData {
  name: string;
  location: string;
  date: string;
  status: 'draft' | 'live' | 'archived';
  internal_notes?: string;
  image_urls: string[];
}

const FormSection: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="glass-card overflow-hidden animate-fade-in group !p-0">
    <div className="p-6 md:px-10 md:py-8 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group-hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7bb302]/10 rounded-2xl flex items-center justify-center text-[#7bb302] group-hover:scale-110 transition-transform shrink-0">
          <Icon size={24} />
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">{title}</h3>
      </div>
    </div>
    <div className="p-6 md:p-12 space-y-8 md:space-y-12 bg-black/10">
      {children}
    </div>
  </section>
);

interface EditionFormUIProps {
  isEditing: boolean;
  editionId?: string;
}

const EditionFormUI: React.FC<EditionFormUIProps> = ({ isEditing, editionId }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadModal, setUploadModal] = useState<{ type: 'edition' | 'speaker' | 'episode' | 'reel' | 'episodeImage'; episodeIndex?: number; speakerIndex?: number; reelId?: string } | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editionData, setEditionData] = useState<EditionFormData>({
    name: '',
    location: '',
    date: '',
    status: 'draft',
    internal_notes: '',
    image_urls: []
  });

  const [episodes, setEpisodes] = useState<EpisodeFormData[]>([
    {
      id: '',
      title: '',
      description: '',
      youtube_url: '',
      duration: '',
      added_date: '',
      thumbnail_url: '',
      images: [],
      speakers: [{ id: '', name: '', role: '', linkedin: '', country: '', location: '', photo_url: '', questions: [{ id: 'new-0', text: '' }] }],
      reels: [{ id: '1', title: '', description: '', views: '', thumbnailUrl: '', url: '' }]
    }
  ]);

  const [schedule, setSchedule] = useState<ScheduleFormData>({
    start_date: '',
    end_date: '',
    tasks: [{ id: '1', title: '', description: '', task_date: '', task_time: '' }]
  });

  const currentEditionId = editionId;
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const extractYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
    if (shortsMatch) return shortsMatch[1];
    const standardMatch = url.match(
      /(?:youtube\.com\/(?:.*[?&]v=|(?:v|e(?:mbed)?)\/)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    return standardMatch ? standardMatch[1] : null;
  };

  useEffect(() => {
    if (isEditing && editionId) {
      loadEditionData(editionId);
    }
  }, [editionId, isEditing]);

  useEffect(() => {
    if (!YOUTUBE_API_KEY) return;

    episodes.forEach((episode, index) => {
      if (!episode.youtube_url || episode.thumbnail_url) return;
      
      const videoId = extractYoutubeVideoId(episode.youtube_url);
      if (!videoId) return;

      fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const item = data.items?.[0];
          if (item?.snippet?.thumbnails) {
            const thumb = item.snippet.thumbnails.maxres?.url || 
                          item.snippet.thumbnails.high?.url || 
                          item.snippet.thumbnails.medium?.url;
            if (thumb) {
              handleUpdateEpisode(index, 'thumbnail_url', thumb);
            }
          }
        })
        .catch(err => console.error('YouTube API fetch failed:', err));
    });
  }, [episodes.map(ep => ep.youtube_url).join(',')]);

  const loadEditionData = async (id: string) => {
    try {
      setLoading(true);
      const edition = await editionsAPI.getById(id);
      let imageUrls: string[] = [];
      if (edition.image_urls) {
        imageUrls = edition.image_urls;
      } else if (edition.image_url) {
        try {
          imageUrls = JSON.parse(edition.image_url);
        } catch {
          imageUrls = [edition.image_url];
        }
      }
      setEditionData({
        name: edition.name || '',
        location: edition.location || '',
        date: edition.date || '',
        status: edition.status || 'draft',
        internal_notes: edition.internal_notes || '',
        image_urls: imageUrls
      });

      const episodesData = await episodesAPI.getAll(id);
      if (episodesData.length > 0) {
        const episodesWithReels = await Promise.all(episodesData.map(async (ep: any) => {
          const reelsData = await reelsAPI.getAll(undefined, ep.id);
          let episodeImages: string[] = [];
          if (ep.images) {
            if (Array.isArray(ep.images)) {
              episodeImages = ep.images;
            } else if (typeof ep.images === 'string') {
              try {
                episodeImages = JSON.parse(ep.images);
              } catch {
                episodeImages = [];
              }
            }
          }
          return {
            id: ep.id,
            title: ep.title || '',
            description: ep.description || '',
            youtube_url: ep.youtube_url || '',
            duration: ep.duration || '',
            added_date: ep.added_date || '',
            thumbnail_url: ep.thumbnail_url || '',
            images: episodeImages,
            speakers: ep.speakers && ep.speakers.length > 0 
              ? ep.speakers.map((s: any) => ({
                  id: s.id || '',
                  name: s.name || '',
                  role: s.role || '',
                  linkedin: s.linkedin || '',
                  country: s.country || '',
                  location: s.location || '',
                  photo_url: s.photo_url || '',
                  questions: s.questions && s.questions.length > 0 
                    ? s.questions.map((q: any, idx: number) => ({ id: q.id || `new-${idx}`, text: q.text || q || '' }))
                    : [{ id: 'new-0', text: '' }]
                }))
              : [{ id: '', name: '', role: '', linkedin: '', country: '', location: '', photo_url: '', questions: [{ id: 'new-0', text: '' }] }],
            reels: reelsData.length > 0
              ? reelsData.map((r: any) => ({
                  id: r.id,
                  title: r.title || '',
                  description: r.description || '',
                  views: r.views || '',
                  thumbnailUrl: r.thumbnail_url || '',
                  url: r.url || ''
                }))
              : [{ id: Math.random().toString(36).substr(2, 9), title: '', description: '', views: '', thumbnailUrl: '', url: '' }]
          };
        }));
        setEpisodes(episodesWithReels);
      }

      const schedulesData = await schedulesAPI.getAll(id);
      if (schedulesData.length > 0) {
        const scheduleData = schedulesData[0];
        const tasksData = await scheduleTasksAPI.getAll(scheduleData.id);
        setSchedule({
          id: scheduleData.id,
          start_date: scheduleData.start_date || '',
          end_date: scheduleData.end_date || '',
          tasks: tasksData.length > 0
            ? tasksData.map((t: any) => ({
                id: t.id,
                title: t.title || '',
                description: t.description || '',
                task_date: t.task_date || '',
                task_time: t.task_time || ''
              }))
            : [{ id: Math.random().toString(36).substr(2, 9), title: '', description: '', task_date: '', task_time: '' }]
        });
      }
    } catch (err) {
      console.error('Failed to load edition:', err);
      setSaveMessage({ type: 'error', text: 'Failed to load edition data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditionFormData, value: string) => {
    setEditionData(prev => ({ ...prev, [field]: value }));
  };

  const handleRemoveEditionImage = async (index: number) => {
    const imageToRemove = editionData.image_urls[index];
    setEditionData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
    
    if (isEditing && currentEditionId && imageToRemove) {
      try {
        const currentEdition = await editionsAPI.getById(currentEditionId);
        let remainingImages = currentEdition.image_urls || [];
        if (remainingImages.length === 0 && currentEdition.image_url) {
          try {
            remainingImages = JSON.parse(currentEdition.image_url);
          } catch {
            remainingImages = [currentEdition.image_url];
          }
        }
        const updatedImages = remainingImages.filter((url: string) => url !== imageToRemove);
        await editionsAPI.update(currentEditionId, { image_url: updatedImages.length > 0 ? JSON.stringify(updatedImages) : null });
      } catch (err) {
        console.error('Failed to delete image from database:', err);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    try {
      let folder = 'images';
      if (uploadModal?.type === 'edition') folder = 'editions';
      else if (uploadModal?.type === 'speaker') folder = 'speakers';
      else if (uploadModal?.type === 'episode') folder = 'episodes';
      else if (uploadModal?.type === 'reel') folder = 'reels';
      else if (uploadModal?.type === 'episodeImage' && uploadModal.episodeIndex !== undefined) {
        const episodeTitle = episodes[uploadModal.episodeIndex]?.title || 'untitled';
        folder = `episode/${episodeTitle.toLowerCase().replace(/\s+/g, '-')}`;
      }
      
      const publicUrl = await uploadAPI.uploadImage(file, 'images', folder);
      
      if (publicUrl) {
        if (uploadModal?.type === 'edition') {
          setEditionData(prev => ({ ...prev, image_urls: [...prev.image_urls, publicUrl] }));
        } else if (uploadModal?.type === 'speaker' && uploadModal.episodeIndex !== undefined && uploadModal.speakerIndex !== undefined) {
          handleUpdateSpeakerInEpisode(uploadModal.episodeIndex, uploadModal.speakerIndex, 'photo_url', publicUrl);
        } else if (uploadModal?.type === 'episode' && uploadModal.episodeIndex !== undefined) {
          handleUpdateEpisode(uploadModal.episodeIndex, 'thumbnail_url', publicUrl);
        } else if (uploadModal?.type === 'reel' && uploadModal.episodeIndex !== undefined && uploadModal.reelId) {
          handleUpdateReelInEpisode(uploadModal.episodeIndex, uploadModal.reelId, 'thumbnailUrl', publicUrl);
        } else if (uploadModal?.type === 'episodeImage' && uploadModal.episodeIndex !== undefined) {
          handleAddImageToEpisode(uploadModal.episodeIndex, publicUrl);
        }
        setUploadModal(null);
        setUploadPreview(null);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setSaveMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScheduleChange = (field: keyof ScheduleFormData, value: string) => {
    setSchedule(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEpisode = () => {
    setEpisodes([...episodes, {
      id: '',
      title: '',
      description: '',
      youtube_url: '',
      duration: '',
      added_date: '',
      thumbnail_url: '',
      images: [],
      speakers: [{ id: '', name: '', role: '', linkedin: '', country: '', location: '', photo_url: '', questions: [{ id: `new-${Date.now()}`, text: '' }] }],
      reels: [{ id: Math.random().toString(36).substr(2, 9), title: '', description: '', views: '', thumbnailUrl: '', url: '' }]
    }]);
  };

  const handleRemoveEpisode = async (index: number) => {
    const episodeToRemove = episodes[index];
    if (episodeToRemove?.id && currentEditionId) {
      try {
        await episodesAPI.delete(episodeToRemove.id);
      } catch (err) {
        console.error('Failed to delete episode:', err);
      }
    }
    setEpisodes(episodes.filter((_, i) => i !== index));
  };

  const handleUpdateEpisode = (index: number, field: keyof EpisodeFormData, value: any) => {
    setEpisodes(episodes.map((ep, i) => {
      if (i === index) {
        return { ...ep, [field]: value };
      }
      return ep;
    }));
  };

  const handleAddSpeakerToEpisode = (episodeIndex: number) => {
    setEpisodes(episodes.map((ep, i) => {
      if (i === episodeIndex) {
        return {
          ...ep,
          speakers: [...ep.speakers, { id: '', name: '', role: '', linkedin: '', country: '', location: '', photo_url: '', questions: [{ id: `new-${Date.now()}`, text: '' }] }]
        };
      }
      return ep;
    }));
  };

  const handleRemoveSpeakerFromEpisode = async (episodeIndex: number, speakerIndex: number) => {
    const episode = episodes[episodeIndex];
    const speakerToRemove = episode?.speakers[speakerIndex];
    
    if (episode?.id && speakerToRemove?.id && currentEditionId) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/episodes/${episode.id}/speakers/${speakerToRemove.id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Failed to delete speaker:', err);
      }
    }
    
    setEpisodes(episodes.map((ep, i) => {
      if (i === episodeIndex) {
        return {
          ...ep,
          speakers: ep.speakers.filter((_, si) => si !== speakerIndex)
        };
      }
      return ep;
    }));
  };

  const handleUpdateSpeakerInEpisode = (episodeIndex: number, speakerIndex: number, field: keyof SpeakerWithQuestions, value: string) => {
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          speakers: ep.speakers.map((s, si) => {
            if (si === speakerIndex) {
              return { ...s, [field]: value };
            }
            return s;
          })
        };
      }
      return ep;
    }));
  };

  const handleAddQuestionToSpeaker = (episodeIndex: number, speakerIndex: number) => {
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          speakers: ep.speakers.map((s, si) => {
            if (si === speakerIndex) {
              return { ...s, questions: [...(s.questions || []), { id: `new-${Date.now()}`, text: '' }] };
            }
            return s;
          })
        };
      }
      return ep;
    }));
  };

  const handleRemoveQuestionFromSpeaker = async (episodeIndex: number, speakerIndex: number, questionIndex: number) => {
    const episode = episodes[episodeIndex];
    const speaker = episode?.speakers[speakerIndex];
    const questionToRemove = speaker?.questions?.[questionIndex];
    
    if (episode?.id && questionToRemove?.id && !questionToRemove.id.startsWith('new')) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/episodes/${episode.id}/questions/${questionToRemove.id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Failed to delete question:', err);
      }
    }
    
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          speakers: ep.speakers.map((s, si) => {
            if (si === speakerIndex && s.questions) {
              const newQuestions = [...s.questions];
              newQuestions.splice(questionIndex, 1);
              return { ...s, questions: newQuestions.length > 0 ? newQuestions : [{ id: 'new-0', text: '' }] };
            }
            return s;
          })
        };
      }
      return ep;
    }));
  };

  const handleUpdateQuestion = (episodeIndex: number, speakerIndex: number, questionIndex: number, value: string) => {
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          speakers: ep.speakers.map((s, si) => {
            if (si === speakerIndex && s.questions) {
              const newQuestions = [...s.questions];
              newQuestions[questionIndex] = { ...newQuestions[questionIndex], text: value };
              return { ...s, questions: newQuestions };
            }
            return s;
          })
        };
      }
      return ep;
    }));
  };

  const handleAddReelToEpisode = (episodeIndex: number) => {
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          reels: [...ep.reels, { id: Math.random().toString(36).substr(2, 9), title: '', description: '', views: '', thumbnailUrl: '', url: '' }]
        };
      }
      return ep;
    }));
  };

  const handleRemoveReelFromEpisode = async (episodeIndex: number, reelId: string) => {
    const reel = episodes[episodeIndex]?.reels.find(r => r.id === reelId);
    
    if (reel && reel.id && !reel.id.startsWith('m') && !reel.id.startsWith('r')) {
      try {
        await reelsAPI.delete(reel.id);
      } catch (err) {
        console.error('Failed to delete reel:', err);
      }
    }
    
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          reels: ep.reels.filter(r => r.id !== reelId)
        };
      }
      return ep;
    }));
  };

  const handleUpdateReelInEpisode = (episodeIndex: number, reelId: string, field: keyof PodcastReel, value: string) => {
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          reels: ep.reels.map(r => r.id === reelId ? { ...r, [field]: value } : r)
        };
      }
      return ep;
    }));
  };

  const handleAddImageToEpisode = (episodeIndex: number, imageUrl: string) => {
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          images: [...(ep.images || []), imageUrl]
        };
      }
      return ep;
    }));
  };

  const handleRemoveImageFromEpisode = (episodeIndex: number, imageIndex: number) => {
    setEpisodes(episodes.map((ep, ei) => {
      if (ei === episodeIndex) {
        return {
          ...ep,
          images: (ep.images || []).filter((_, i) => i !== imageIndex)
        };
      }
      return ep;
    }));
  };

  const handleAddTask = () => {
    setSchedule(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Math.random().toString(36).substr(2, 9), title: '', description: '', task_date: '', task_time: '' }]
    }));
  };

  const handleRemoveTask = async (taskId: string) => {
    const task = schedule.tasks.find(t => t.id === taskId);
    
    if (task?.id && schedule.id && !task.id.startsWith('m') && !task.id.startsWith('r')) {
      try {
        await scheduleTasksAPI.delete(task.id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
    
    setSchedule(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const handleUpdateTask = (taskId: string, field: keyof ScheduleTaskFormData, value: string) => {
    setSchedule(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t)
    }));
  };

  const handleSaveAll = async () => {
    if (!editionData.name) {
      setSaveMessage({ type: 'error', text: 'Please enter an edition name' });
      return;
    }
    if (!editionData.location) {
      setSaveMessage({ type: 'error', text: 'Please select a location' });
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);

      let editionIdToUse = currentEditionId;

      const editionPayload = {
        name: editionData.name,
        location: editionData.location || null,
        date: editionData.date || new Date().toISOString().split('T')[0],
        status: editionData.status || 'draft',
        internal_notes: editionData.internal_notes || null,
        image_url: editionData.image_urls.length > 0 ? JSON.stringify(editionData.image_urls) : null
      };

      if (isEditing && currentEditionId) {
        await editionsAPI.update(currentEditionId, editionPayload);
      } else {
        const newEdition = await editionsAPI.create(editionPayload);
        editionIdToUse = newEdition.id;
        navigate(`/edition/edit/${editionIdToUse}`, { replace: true });
      }

      const existingEpisodes = await episodesAPI.getAll(editionIdToUse);
      const existingIds = new Set(existingEpisodes.map((ep: any) => ep.id));
      const newIds = new Set(episodes.filter(ep => ep.id).map(ep => ep.id));
      
      for (const ep of existingEpisodes) {
        if (!newIds.has(ep.id)) {
          await episodesAPI.delete(ep.id);
        }
      }
      
      for (const episode of episodes.filter(ep => ep.title.trim())) {
        let episodeId: string;
        
        if (episode.id && existingIds.has(episode.id)) {
          await episodesAPI.update(episode.id, {
            title: episode.title,
            description: episode.description || null,
            youtube_url: episode.youtube_url || null,
            duration: episode.duration || null,
            added_date: episode.added_date || null,
            thumbnail_url: episode.thumbnail_url || null,
            images: episode.images || [],
            speakers: episode.speakers.filter(s => s.name.trim()).map(speaker => ({
              id: speaker.id || undefined,
              name: speaker.name,
              role: speaker.role || null,
              linkedin: speaker.linkedin || null,
              country: speaker.country || null,
              location: speaker.location || null,
              photo_url: speaker.photo_url || null,
              questions: speaker.questions ? speaker.questions.filter(q => q.text && q.text.trim()).map(q => q.text) : []
            }))
          });
          episodeId = episode.id;
        } else {
          const newEpisode = await episodesAPI.create({
            edition_id: editionIdToUse,
            title: episode.title,
            description: episode.description || null,
            youtube_url: episode.youtube_url || null,
            duration: episode.duration || null,
            added_date: episode.added_date || null,
            thumbnail_url: episode.thumbnail_url || null,
            images: episode.images || [],
            speakers: episode.speakers.filter(s => s.name.trim()).map(speaker => ({
              id: speaker.id || undefined,
              name: speaker.name,
              role: speaker.role || null,
              linkedin: speaker.linkedin || null,
              country: speaker.country || null,
              location: speaker.location || null,
              photo_url: speaker.photo_url || null,
              questions: speaker.questions ? speaker.questions.filter(q => q.text && q.text.trim()).map(q => q.text) : []
            }))
          });
          episodeId = newEpisode.id;
        }
        
        const existingReels = await reelsAPI.getAll(editionIdToUse, episodeId);
        for (const r of existingReels) {
          await reelsAPI.delete(r.id);
        }

        for (const reel of episode.reels.filter(r => r.url.trim())) {
          await reelsAPI.create({
            edition_id: editionIdToUse,
            episode_id: episodeId,
            title: reel.title,
            description: reel.description,
            views: reel.views,
            thumbnail_url: reel.thumbnailUrl,
            url: reel.url
          });
        }
      }

      if (schedule.start_date && schedule.end_date) {
        let scheduleId = schedule.id;

        if (scheduleId) {
          await schedulesAPI.update(scheduleId, {
            start_date: schedule.start_date,
            end_date: schedule.end_date
          });
        } else {
          const newSchedule = await schedulesAPI.create({
            edition_id: editionIdToUse,
            start_date: schedule.start_date,
            end_date: schedule.end_date
          });
          scheduleId = newSchedule.id;
        }

        const existingTasks = await scheduleTasksAPI.getAll(scheduleId);
        for (const t of existingTasks) {
          await scheduleTasksAPI.delete(t.id);
        }

        for (const task of schedule.tasks.filter(t => t.title.trim())) {
          await scheduleTasksAPI.create({
            schedule_id: scheduleId,
            title: task.title,
            description: task.description || null,
            task_date: task.task_date || null,
            task_time: task.task_time || null
          });
        }
      }

      setSaveMessage({ type: 'success', text: 'All changes saved successfully!' });
      if (editionIdToUse) {
        loadEditionData(editionIdToUse);
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#7bb302]" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {saveMessage && (
        <div className={`p-4 rounded-xl ${
          saveMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {saveMessage.text}
        </div>
      )}
      <header className="flex flex-col gap-6">
        <Link to={isEditing ? "/editions/edit" : "/"} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all text-base group mb-8 w-fit">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>{isEditing ? 'Back to Editions' : 'Back to Dashboard'}</span>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white underline decoration-[#7bb302]/50 decoration-4 underline-offset-8 decoration-dashed">
              {isEditing ? 'Modify Edition' : 'New Edition'}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-sm md:text-base">
              Configure metadata, episodes, and multimedia assets for this geographical edition.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSaveAll}
              disabled={saving}
              className="btn-primary flex items-center justify-center gap-2 !px-6 !py-3"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <SaveAll size={18} />}
              <span>{saving ? 'Saving...' : isEditing ? 'Update Edition' : 'Create Edition'}</span>
            </button>
            <div className="px-5 py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-widest whitespace-nowrap">{editionData.status || 'Draft Mode'}</div>
          </div>
        </div>
      </header>

      <FormSection title="Edition Metadata" icon={Mic}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="label">Edition Name</label>
            <input 
              type="text" 
              placeholder="e.g. Singapore 2024" 
              className="input-field"
              value={editionData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="label">Location</label>
            <input 
              type="text" 
              placeholder="Enter location (e.g., Singapore, Dubai, Mumbai)"
              className="input-field"
              value={editionData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="label">Date</label>
            <input 
              type="date" 
              className="input-field"
              value={editionData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="label">Status</label>
            <select 
              className="input-field appearance-none cursor-pointer pr-10 relative z-10 bg-transparent"
              value={editionData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="draft" className="bg-[#0a0a0c] text-white py-2">Draft</option>
              <option value="live" className="bg-[#0a0a0c] text-white py-2">Live</option>
              <option value="archived" className="bg-[#0a0a0c] text-white py-2">Archived</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="label">Edition Images</label>
            <div className="flex flex-wrap gap-3">
              {editionData.image_urls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group">
                  <img src={url} alt={`Edition ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveEditionImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div 
                onClick={() => setUploadModal({ type: 'edition' })}
                className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-[#7bb302]/50 transition-colors"
              >
                <Plus size={24} className="text-muted-foreground opacity-50" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Click + to add more images</p>
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="label">Internal Notes</label>
            <textarea 
              placeholder="Any context or private notes for this edition..." 
              className="input-field min-h-[100px] resize-none"
              value={editionData.internal_notes}
              onChange={(e) => handleInputChange('internal_notes', e.target.value)}
            ></textarea>
          </div>
        </div>
      </FormSection>

      <FormSection title="Episodes" icon={Video}>
        <div className="space-y-8">
          {episodes.map((episode, episodeIndex) => (
            <div key={episodeIndex} className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">Episode {episodeIndex + 1}</h4>
                {episodes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEpisode(episodeIndex)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="label">Episode Title</label>
                  <input 
                    type="text" 
                    placeholder="Featured Episode Name" 
                    className="input-field"
                    value={episode.title}
                    onChange={(e) => handleUpdateEpisode(episodeIndex, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="label">YouTube Embed URL</label>
                  <input 
                    type="text" 
                    placeholder="https://youtube.com/embed/..." 
                    className="input-field"
                    value={episode.youtube_url}
                    onChange={(e) => handleUpdateEpisode(episodeIndex, 'youtube_url', e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="label">Duration</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1h 24m" 
                    className="input-field"
                    value={episode.duration}
                    onChange={(e) => handleUpdateEpisode(episodeIndex, 'duration', e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="label">Added Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={episode.added_date}
                    onChange={(e) => handleUpdateEpisode(episodeIndex, 'added_date', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="label">Description</label>
                <textarea 
                  placeholder="Summarize the core conversation and key takeaways..." 
                  className="input-field min-h-[100px] resize-none"
                  value={episode.description}
                  onChange={(e) => handleUpdateEpisode(episodeIndex, 'description', e.target.value)}
                ></textarea>
              </div>

              <div className="space-y-3">
                <label className="label">Thumbnail</label>
                <div className="flex gap-3 items-center">
                  <div 
                    onClick={() => setUploadModal({ type: 'episode', episodeIndex })}
                    className="w-24 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-[#7bb302]/50 transition-colors overflow-hidden shrink-0"
                  >
                    {episode.thumbnail_url ? (
                      <img src={episode.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <Plus size={20} className="text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter URL or upload from PC" 
                    className="input-field flex-1"
                    value={episode.thumbnail_url}
                    onChange={(e) => handleUpdateEpisode(episodeIndex, 'thumbnail_url', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h5 className="text-white font-bold">Episode Images</h5>
                  <button
                    type="button"
                    onClick={() => setUploadModal({ type: 'episodeImage', episodeIndex })}
                    className="text-sm text-[#7bb302] hover:text-[#6da002] flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Image
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {(episode.images || []).map((img, imgIndex) => (
                    <div key={imgIndex} className="relative group aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10">
                      <img src={img} alt={`Episode image ${imgIndex + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageFromEpisode(episodeIndex, imgIndex)}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(episode.images || []).length === 0 && (
                    <div 
                      onClick={() => setUploadModal({ type: 'episodeImage', episodeIndex })}
                      className="aspect-video rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-[#7bb302]/50 transition-colors"
                    >
                      <Plus size={20} className="text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h5 className="text-white font-bold">Speakers & Questions</h5>
                </div>
                {episode.speakers.map((speaker, speakerIndex) => (
                  <div key={speakerIndex} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Speaker {speakerIndex + 1}</span>
                      {episode.speakers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpeakerFromEpisode(episodeIndex, speakerIndex)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <GuestSpeakerCard
                      speaker={speaker}
                      onUpdate={(_id, field, value) => handleUpdateSpeakerInEpisode(episodeIndex, speakerIndex, field, value)}
                      onRemove={() => handleRemoveSpeakerFromEpisode(episodeIndex, speakerIndex)}
                      onUploadPhoto={() => setUploadModal({ type: 'speaker', episodeIndex, speakerIndex })}
                    />
                    
                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[#7bb302]">
                        <MessageCircle size={16} />
                        <label className="label !text-[#7bb302] text-sm">Questions for {speaker.name || 'this speaker'}</label>
                      </div>
                      <div className="space-y-2">
                        {(speaker.questions || [{ id: 'new-0', text: '' }]).map((question, qIndex) => (
                          <div key={question.id} className="flex items-center gap-2">
                            <span className="w-6 h-6 shrink-0 rounded-full bg-[#7bb302]/20 text-[#7bb302] text-xs font-bold flex items-center justify-center">{qIndex + 1}</span>
                            <input
                              type="text"
                              className="input-field flex-1 py-2 text-sm"
                              placeholder={`Question for ${speaker.name || 'speaker'}...`}
                              value={question.text}
                              onChange={(e) => handleUpdateQuestion(episodeIndex, speakerIndex, qIndex, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionFromSpeaker(episodeIndex, speakerIndex, qIndex)}
                              disabled={(speaker.questions || []).length <= 1}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddQuestionToSpeaker(episodeIndex, speakerIndex)}
                        className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-white"
                      >
                        <Plus size={12} />
                        <span>Add Question</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSpeakerToEpisode(episodeIndex)}
                  className="flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl text-muted-foreground hover:text-white hover:border-[#7bb302]/50 text-sm"
                >
                  <Plus size={16} />
                  <span>Add Speaker</span>
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#7bb302]">
                    <Film size={16} />
                    <h5 className="text-white font-bold">Reels</h5>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {episode.reels.map((reel) => (
                    <PodcastReelCard
                      key={reel.id}
                      reel={reel}
                      onUpdate={(id, field, value) => handleUpdateReelInEpisode(episodeIndex, id, field, value)}
                      onRemove={(id) => handleRemoveReelFromEpisode(episodeIndex, id)}
                      onUploadThumbnail={(id) => setUploadModal({ type: 'reel', episodeIndex, reelId: id })}
                    />
                  ))}
                  <button 
                    type="button"
                    onClick={() => handleAddReelToEpisode(episodeIndex)}
                    className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-white/20 rounded-xl text-muted-foreground hover:text-white hover:border-[#7bb302]/50 hover:bg-[#7bb302]/5 transition-all min-h-[150px]"
                  >
                    <Plus size={24} className="text-[#7bb302]/50" />
                    <span className="text-xs font-bold">Add Reel</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddEpisode}
            className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-white/20 rounded-2xl text-muted-foreground hover:text-white hover:border-[#7bb302]/50 hover:bg-[#7bb302]/5 transition-all text-sm font-bold"
          >
            <Plus size={20} />
            <span>Add New Episode</span>
          </button>
        </div>
      </FormSection>

      <FormSection title="Schedule" icon={Calendar}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="label">Start Date</label>
              <input 
                type="date" 
                className="input-field"
                value={schedule.start_date}
                onChange={(e) => handleScheduleChange('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="label">End Date</label>
              <input 
                type="date" 
                className="input-field"
                value={schedule.end_date}
                onChange={(e) => handleScheduleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-[#7bb302]" />
              <h4 className="text-white font-bold">Tasks</h4>
            </div>
            
            {schedule.tasks.map((task, taskIndex) => (
              <div key={task.id} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Task {taskIndex + 1}</span>
                  {schedule.tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(task.id || '')}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label">Task Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Registration Opens" 
                      className="input-field"
                      value={task.title}
                      onChange={(e) => handleUpdateTask(task.id || '', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label">Date</label>
                    <input 
                      type="date" 
                      className="input-field"
                      value={task.task_date}
                      onChange={(e) => handleUpdateTask(task.id || '', 'task_date', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label">Description (optional)</label>
                    <input 
                      type="text" 
                      placeholder="Brief description..." 
                      className="input-field"
                      value={task.description}
                      onChange={(e) => handleUpdateTask(task.id || '', 'description', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label">Time (optional)</label>
                    <input 
                      type="time" 
                      className="input-field"
                      value={task.task_time}
                      onChange={(e) => handleUpdateTask(task.id || '', 'task_time', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={handleAddTask}
              className="flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl text-muted-foreground hover:text-white hover:border-[#7bb302]/50 text-sm"
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </FormSection>

      {/* UPLOAD MODAL */}
      {uploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-8 relative flex flex-col gap-6 shadow-2xl border border-white/20">
            <button 
              onClick={() => { setUploadModal(null); setUploadPreview(null); }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#7bb302]/20 rounded-2xl mx-auto flex items-center justify-center text-[#7bb302] mb-4">
                <Film size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Upload Image</h3>
              <p className="text-muted-foreground text-sm">
                Select an image for {uploadModal.type === 'edition' ? 'the edition' : uploadModal.type === 'speaker' ? 'the speaker' : uploadModal.type === 'episode' ? 'the episode thumbnail' : 'the reel thumbnail'}
              </p>
            </div>

            <div 
              onClick={handleConfirmUpload}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#7bb302]/50 hover:bg-[#7bb302]/5 transition-all"
            >
              {uploading ? (
                <Loader2 size={32} className="mx-auto animate-spin text-[#7bb302]" />
              ) : (
                <>
                  <Plus size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to select file</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="label">Or paste URL</label>
              <input 
                type="text" 
                placeholder="https://..." 
                className="input-field"
                value={uploadPreview || ''}
                onChange={(e) => {
                  const url = e.target.value;
                  if (uploadModal?.type === 'edition') {
                    setEditionData(prev => ({ ...prev, image_urls: [...prev.image_urls, url] }));
                  } else if (uploadModal?.type === 'speaker' && uploadModal.episodeIndex !== undefined && uploadModal.speakerIndex !== undefined) {
                    handleUpdateSpeakerInEpisode(uploadModal.episodeIndex, uploadModal.speakerIndex, 'photo_url', url);
                  } else if (uploadModal?.type === 'episode' && uploadModal.episodeIndex !== undefined) {
                    handleUpdateEpisode(uploadModal.episodeIndex, 'thumbnail_url', url);
                  } else if (uploadModal?.type === 'reel' && uploadModal.episodeIndex !== undefined && uploadModal.reelId) {
                    handleUpdateReelInEpisode(uploadModal.episodeIndex, uploadModal.reelId, 'thumbnailUrl', url);
                  }
                  setUploadModal(null);
                }}
              />
            </div>

            <button 
              onClick={() => { setUploadModal(null); setUploadPreview(null); }}
              className="btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default EditionFormUI;

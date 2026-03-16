import React, { useMemo, useEffect, useState } from 'react';
import { Film, Eye, Loader2 } from 'lucide-react';

export interface PodcastReel {
  id: string;
  title: string;
  description: string;
  views: string;
  thumbnailUrl: string;
  url: string;
}

interface PodcastReelCardProps {
  reel: PodcastReel;
  onUpdate: (id: string, field: keyof PodcastReel, value: string) => void;
  onRemove: (id: string) => void;
  onUploadThumbnail?: (id: string) => void;
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const extractYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  // Explicitly match Shorts: youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
  if (shortsMatch) return shortsMatch[1];
  // Standard URLs: youtu.be, watch?v=, embed/, v/
  const standardMatch = url.match(
    /(?:youtube\.com\/(?:.*[?&]v=|(?:v|e(?:mbed)?)\/)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  return standardMatch ? standardMatch[1] : null;
};

// Whether the URL looks like a YouTube Short
const isShort = (url: string) => /youtube\.com\/shorts\//i.test(url);

const formatViews = (count: string) => {
  const n = parseInt(count, 10);
  if (isNaN(n)) return count;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
};

const PodcastReelCard: React.FC<PodcastReelCardProps> = ({ reel, onUpdate, onRemove, onUploadThumbnail }) => {
  const videoId = useMemo(() => extractYoutubeVideoId(reel.url), [reel.url]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!videoId || !YOUTUBE_API_KEY) return;

    setIsFetching(true);
    fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    )
      .then(res => res.json())
      .then(data => {
        const item = data.items?.[0];
        if (!item) return;

        const { snippet, statistics } = item;
        // Always overwrite title & description from the API so pasting a new URL refreshes them
        onUpdate(reel.id, 'title', snippet.title ?? '');
        onUpdate(reel.id, 'description', snippet.description?.split('\n')[0] ?? '');
        onUpdate(reel.id, 'views', statistics.viewCount ?? '0');
        const thumb =
          snippet.thumbnails?.maxres?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          '';
        onUpdate(reel.id, 'thumbnailUrl', thumb);
      })
      .catch(err => console.error('YouTube API fetch failed:', err))
      .finally(() => setIsFetching(false));
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="glass-card p-4 flex flex-col gap-4 text-white border border-white/5 group hover:border-white/10 transition-colors">
      {/* Video preview / thumbnail */}
      <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-slate-600 overflow-hidden relative border border-white/10">
        {isFetching && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-xl">
            <Loader2 size={28} className="animate-spin text-[#7bb302]" />
          </div>
        )}
        {videoId ? (
          <iframe
            src={isShort(reel.url)
              ? `https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}`
              : `https://www.youtube.com/embed/${videoId}`
            }
            title="YouTube Video Preview"
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <Film size={32} />
        )}
      </div>

      {/* Views badge — shown once data is available */}
      {reel.views && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground -mt-2">
          <Eye size={13} />
          <span className="font-semibold">{formatViews(reel.views)}</span>
        </div>
      )}

      {/* URL (first so user pastes here) */}
      <div className="space-y-2">
        <label className="label">Video URL</label>
        <input
          type="text"
          className="input-field py-2 text-xs"
          placeholder="Paste a YouTube URL…"
          value={reel.url}
          onChange={(e) => onUpdate(reel.id, 'url', e.target.value)}
        />
      </div>

      {/* Auto-filled / editable title */}
      <div className="space-y-2">
        <label className="label">Reel Title</label>
        <input
          type="text"
          className="input-field py-2 text-xs"
          placeholder="Auto-filled from YouTube"
          value={reel.title}
          onChange={(e) => onUpdate(reel.id, 'title', e.target.value)}
        />
      </div>

      {/* Auto-filled / editable description */}
      <div className="space-y-2">
        <label className="label">Description</label>
        <textarea
          className="input-field py-2 text-xs min-h-[72px] resize-none"
          placeholder="Auto-filled from YouTube"
          value={reel.description}
          onChange={(e) => onUpdate(reel.id, 'description', e.target.value)}
        />
      </div>

      {/* Thumbnail URL (read-only preview of fetched URL, editable override) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="label">Thumbnail URL</label>
          {onUploadThumbnail && (
            <button
              type="button"
              onClick={() => onUploadThumbnail(reel.id)}
              className="text-xs text-[#7bb302] hover:underline font-medium"
            >
              Upload
            </button>
          )}
        </div>
        <input
          type="text"
          className="input-field py-2 text-xs"
          placeholder="Auto-filled from YouTube"
          value={reel.thumbnailUrl}
          onChange={(e) => onUpdate(reel.id, 'thumbnailUrl', e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(reel.id)}
        className="w-full py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-destructive/20 transition-all mt-auto"
      >
        Remove Reel
      </button>
    </div>
  );
};

export default PodcastReelCard;

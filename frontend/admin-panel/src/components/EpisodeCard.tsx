import React from 'react';
import { Video, Trash2, Edit2, User, Clock, ExternalLink } from 'lucide-react';

interface EpisodeCardProps {
  id?: string;
  title: string;
  description: string;
  youtube_url: string;
  duration: string;
  added_date: string;
  thumbnail_url: string;
  speakerCount?: number;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({
  id,
  title,
  description,
  youtube_url,
  duration,
  added_date,
  thumbnail_url,
  speakerCount = 0,
  onEdit,
  onRemove
}) => {
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:.*[?&]v=|(?:v|e(?:mbed)?)\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(youtube_url);
  const thumbnail = thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

  return (
    <div className="glass-card p-6 flex flex-col gap-4 border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#7bb302]/20 rounded-xl flex items-center justify-center text-[#7bb302] shrink-0">
            <Video size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-bold truncate">{title || 'Untitled Episode'}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {duration}
                </span>
              )}
              {speakerCount > 0 && (
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {speakerCount} speaker{speakerCount !== 1 ? 's' : ''}
                </span>
              )}
              {added_date && (
                <span>{new Date(added_date).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {youtube_url && (
            <a 
              href={youtube_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="View on YouTube"
            >
              <ExternalLink size={16} />
            </a>
          )}
          {onEdit && id && (
            <button 
              onClick={() => onEdit(id)}
              className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Edit Episode"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onRemove && id && (
            <button 
              onClick={() => onRemove(id)}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Remove Episode"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      )}

      {thumbnail && (
        <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          )}
        </div>
      )}
    </div>
  );
};

export default EpisodeCard;

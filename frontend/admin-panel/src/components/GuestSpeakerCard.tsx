import React from 'react';
import { UserPlus, Upload, Trash2 } from 'lucide-react';

export interface GuestSpeaker {
  id: string;
  name: string;
  role: string;
  linkedin: string;
  country: string;
  location: string;
  photo_url?: string;
}

interface GuestSpeakerCardProps {
  speaker: GuestSpeaker;
  onUpdate: (id: string, field: keyof GuestSpeaker, value: string) => void;
  onRemove: (id: string) => void;
  onUploadPhoto?: (speakerId: string) => void;
}

const GuestSpeakerCard: React.FC<GuestSpeakerCardProps> = ({ speaker, onUpdate, onRemove, onUploadPhoto }) => {
  const handleUploadClick = () => {
    if (onUploadPhoto) {
      onUploadPhoto(speaker.id || Math.random().toString(36).substr(2, 9));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 group/speaker relative">
      <button 
        onClick={handleUploadClick}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex-shrink-0 border-2 border-white/10 flex items-center justify-center overflow-hidden text-white hover:border-[#7bb302]/50 transition-all relative group/avatar cursor-pointer"
        title="Upload Photo"
        type="button"
      >
        {speaker.photo_url ? (
          <img src={speaker.photo_url} alt={speaker.name} className="w-full h-full object-cover" />
        ) : (
          <>
            <UserPlus size={24} className="group-hover/avatar:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
              <Upload size={16} />
            </div>
          </>
        )}
      </button>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
        <div className="space-y-2">
          <label className="label">Full Name</label>
          <input 
            type="text" 
            className="input-field py-2" 
            placeholder="Speaker name" 
            value={speaker.name}
            onChange={(e) => onUpdate(speaker.id, 'name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="label">Role / Position</label>
          <input 
            type="text" 
            className="input-field py-2" 
            placeholder="C-Suite / Leader" 
            value={speaker.role}
            onChange={(e) => onUpdate(speaker.id, 'role', e.target.value)}
          />
        </div>
        <div className="space-y-2">
           <label className="label">LinkedIn URL</label>
           <input 
            type="text" 
            className="input-field py-2" 
            placeholder="https://linkedin.com/in/..." 
            value={speaker.linkedin}
            onChange={(e) => onUpdate(speaker.id, 'linkedin', e.target.value)}
          />
        </div>
        <div className="space-y-2">
           <label className="label">Country</label>
           <input 
            type="text" 
            className="input-field py-2" 
            placeholder="e.g. United States" 
            value={speaker.country}
            onChange={(e) => onUpdate(speaker.id, 'country', e.target.value)}
          />
        </div>
        <div className="space-y-2">
           <label className="label">Location / City</label>
           <input 
            type="text" 
            className="input-field py-2" 
            placeholder="e.g. New York" 
            value={speaker.location}
            onChange={(e) => onUpdate(speaker.id, 'location', e.target.value)}
          />
        </div>
      </div>
      <button 
        type="button"
        onClick={() => onRemove(speaker.id)}
        className="absolute top-4 right-4 sm:static self-start p-2 text-muted-foreground hover:text-destructive transition-colors bg-black/20 sm:bg-transparent rounded-lg"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default GuestSpeakerCard;

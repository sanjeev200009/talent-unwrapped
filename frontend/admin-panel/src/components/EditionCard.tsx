import React from 'react';
import { Archive, Edit2, MoreVertical, RotateCcw } from 'lucide-react';

interface EditionCardProps {
  id: string;
  name: string;
  location: string;
  date: string;
  status: string;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
}

const EditionCard: React.FC<EditionCardProps> = ({ id, name, location, date, status, onArchive, onRestore }) => {
  return (
    <div className="glass-card p-8 md:p-14 flex flex-col justify-between group h-full">
      <div className="flex justify-between items-start mb-10 md:mb-12">
        <div className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest leading-none ${
          status === 'live' ? 'bg-[#7bb302]/20 text-[#7bb302] border border-[#7bb302]/30' : 
          status === 'draft' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
          'bg-slate-500/20 text-slate-400 border border-slate-500/30'
        }`}>
          {status}
        </div>
        <button className="p-2 md:p-3 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="mb-10 md:mb-12 space-y-3 md:space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">{name}</h3>
        <p className="text-muted-foreground text-base md:text-lg flex items-center gap-2 opacity-80">
          <span className="truncate">{location}</span> • {date}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-auto">
        <button 
          title="Edit"
          onClick={() => window.location.href = `/edition/edit/${id}`}
          className="flex items-center justify-center flex-1 sm:flex-none gap-2 p-3 md:p-4 min-w-[50px] min-h-[50px] md:min-w-[60px] md:min-h-[60px] bg-white/5 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-white transition-all border border-white/5 hover:border-[#7bb302]/30"
        >
          <Edit2 size={18} />
          <span className="hidden xs:block text-xs">Edit</span>
        </button>
        <div className="flex gap-3 md:gap-5">
          {status !== 'archived' && (
            <button 
              title="Archive" 
              onClick={() => onArchive?.(id)}
              className="flex items-center justify-center p-3 md:p-4 min-w-[50px] min-h-[50px] md:min-w-[60px] md:min-h-[60px] bg-white/5 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-all border border-white/5 shrink-0"
            >
              <Archive size={18} />
            </button>
          )}
          {status === 'archived' && (
            <button 
              title="Restore" 
              onClick={() => onRestore?.(id)}
              className="flex items-center justify-center p-3 md:p-4 min-w-[50px] min-h-[50px] md:min-w-[60px] md:min-h-[60px] bg-white/5 hover:bg-[#7bb302]/10 rounded-xl text-muted-foreground hover:text-[#7bb302] transition-all border border-white/5 hover:border-[#7bb302]/30 shrink-0"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditionCard;

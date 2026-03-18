import React, { useState, useRef, useEffect } from 'react';
import { Archive, Edit2, MoreVertical, RotateCcw, Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditionCardProps {
  id: string;
  name: string;
  location: string;
  date: string;
  status: string;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const EditionCard: React.FC<EditionCardProps> = ({ id, name, location, date, status, onArchive, onRestore, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = () => {
    setShowDropdown(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(id);
    setShowDeleteConfirm(false);
  };

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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 md:p-3 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            <MoreVertical size={20} />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl z-20">
              {status !== 'archived' && (
                <button
                  onClick={() => { onArchive?.(id); setShowDropdown(false); }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                  <Archive size={16} />
                  Archive
                </button>
              )}
              {status === 'archived' && (
                <button
                  onClick={() => { onRestore?.(id); setShowDropdown(false); }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                  <RotateCcw size={16} />
                  Restore
                </button>
              )}
              <button
                onClick={handleDeleteClick}
                className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
              >
                <Trash2 size={16} />
                Delete Permanently
              </button>
            </div>
          )}
        </div>
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

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Edition Permanently"
        message={`Are you sure you want to permanently delete "${name}"? This will also delete all episodes, speakers, schedules, and reels associated with this edition. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default EditionCard;

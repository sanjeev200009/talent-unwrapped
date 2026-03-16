import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditionCard from '../components/EditionCard';
import { editionsAPI } from '../lib/api';

interface Edition {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'draft' | 'live' | 'archived';
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEditions();
  }, []);

  const loadEditions = async () => {
    try {
      setLoading(true);
      const data = await editionsAPI.getAll();
      setEditions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load editions');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const edition = editions.find(e => e.id === id);
      if (edition) {
        await editionsAPI.update(id, { ...edition, status: 'archived' });
        loadEditions();
      }
    } catch (err) {
      console.error('Failed to archive edition:', err);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const edition = editions.find(e => e.id === id);
      if (edition) {
        await editionsAPI.update(id, { ...edition, status: 'live' });
        loadEditions();
      }
    } catch (err) {
      console.error('Failed to restore edition:', err);
    }
  };

  const activeEditions = editions.filter(edition => edition.status !== 'archived');
  const liveCount = editions.filter(edition => edition.status === 'live').length;
  const draftCount = editions.filter(edition => edition.status === 'draft').length;

  const filteredEditions = activeEditions.filter(edition => {
    const query = searchQuery.toLowerCase();
    return (
      edition.name.toLowerCase().includes(query) ||
      edition.location.toLowerCase().includes(query) ||
      edition.date.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading editions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-16 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white italic">Editions</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed opacity-60">
            Oversee your global podcast landscape. Manage episodes, regions, and speaker deployments.
          </p>
        </div>
        <Link to="/edition/new" className="btn-primary flex items-center gap-3 !px-8 md:!px-10 !py-4 md:!py-5 hover:scale-105 transition-all shadow-2xl w-full md:w-auto justify-center">
          <Plus size={24} />
          <span className="text-base md:text-lg">New Edition</span>
        </Link>
      </header>

      {/* Professional Dashboard Sub-header */}
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between pb-8 border-b border-white/5">
        <div className="grid grid-cols-2 sm:flex gap-8 sm:gap-16 w-full lg:w-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Total Volume</span>
            <span className="text-2xl md:text-3xl font-black text-white">{activeEditions.length}</span>
          </div>
          <div className="flex flex-col sm:border-l border-white/10 sm:pl-16">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Production Live</span>
            <span className="text-2xl md:text-3xl font-black text-[#7bb302]">{liveCount}</span>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-8 sm:pl-16 hidden sm:flex">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Pending Drafts</span>
            <span className="text-2xl md:text-3xl font-black text-orange-400">{draftCount}</span>
          </div>
        </div>
        <div className="w-full lg:w-[400px] h-14 bg-white/5 border border-white/10 rounded-2xl px-6 flex items-center gap-4 text-muted-foreground hover:bg-white/[0.08] hover:border-[#7bb302]/40 transition-all group focus-within:border-[#7bb302]/50 focus-within:bg-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-focus-within:opacity-100 transition-opacity group-focus-within:text-[#7bb302]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search editions, locations or dates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm font-medium text-white placeholder-muted-foreground"
          />
        </div>
      </div>

      {filteredEditions.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-white/5 border border-white/10 border-dashed rounded-3xl">
          <p className="text-lg font-medium">No editions found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 md:gap-10">
          {filteredEditions.map((edition) => (
            <EditionCard
              key={edition.id}
              {...edition}
              onArchive={handleArchive}
              onRestore={handleRestore}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

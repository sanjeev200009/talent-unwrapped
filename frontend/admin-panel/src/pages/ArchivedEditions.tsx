import React, { useState, useEffect } from 'react';
import EditionCard from '../components/EditionCard';
import { editionsAPI } from '../lib/api';

interface Edition {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'draft' | 'live' | 'archived';
}

const ArchivedEditions: React.FC = () => {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEditions();
  }, []);

  const loadEditions = async () => {
    try {
      setLoading(true);
      const data = await editionsAPI.getAll();
      setEditions(data);
    } catch (err) {
      console.error('Failed to load editions:', err);
    } finally {
      setLoading(false);
    }
  };

  const archivedEditions = editions.filter(edition => edition.status === 'archived');

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

  const handleDelete = async (id: string) => {
    try {
      await editionsAPI.delete(id);
      loadEditions();
    } catch (err) {
      console.error('Failed to delete edition:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-16 animate-fade-in">
      <header className="flex flex-col gap-4 pb-8 border-b border-white/5">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white italic">Archived Editions</h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed opacity-60">
          View your past and inactive podcast editions. Restoring features will be deployed soon.
        </p>
      </header>

      {archivedEditions.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-white/5 border border-white/10 border-dashed rounded-3xl">
          <p className="text-lg font-medium">No archived editions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 md:gap-10">
          {archivedEditions.map((edition) => (
            <EditionCard
              key={edition.id}
              {...edition}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedEditions;

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('editions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('editions')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, location, date, status, internal_notes, image_url } = req.body;
    const { data, error } = await supabase
      .from('editions')
      .insert([{ name, location, date, status, internal_notes, image_url }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, location, date, status, internal_notes, image_url } = req.body;
    const { data, error } = await supabase
      .from('editions')
      .update({ 
        name, 
        location, 
        date, 
        status, 
        internal_notes,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const editionId = req.params.id;

    const extractPath = (url) => {
      if (!url || typeof url !== 'string') return null;
      const match = url.match(/images\/(.+)$/);
      return match ? match[1] : null;
    };

    const { data: edition } = await supabase
      .from('editions')
      .select('image_url')
      .eq('id', editionId)
      .single();

    const { data: speakers } = await supabase
      .from('speakers')
      .select('photo_url')
      .eq('edition_id', editionId);

    const { data: episodes } = await supabase
      .from('episodes')
      .select('id, thumbnail_url, images')
      .eq('edition_id', editionId);

    const { data: reels } = await supabase
      .from('reels')
      .select('thumbnail_url')
      .eq('edition_id', editionId);

    const imagePathsToDelete = [];

    if (edition?.image_url) {
      let editionImages = [];
      if (typeof edition.image_url === 'string') {
        try {
          editionImages = JSON.parse(edition.image_url);
        } catch {
          editionImages = [edition.image_url];
        }
      } else if (Array.isArray(edition.image_url)) {
        editionImages = edition.image_url;
      }
      for (const img of editionImages) {
        const path = extractPath(img);
        if (path) imagePathsToDelete.push(path);
      }
    }

    if (speakers) {
      for (const speaker of speakers) {
        const path = extractPath(speaker.photo_url);
        if (path) imagePathsToDelete.push(path);
      }
    }

    if (episodes) {
      for (const episode of episodes) {
        let epImages = [];
        if (episode.thumbnail_url) {
          epImages.push(episode.thumbnail_url);
        }
        if (episode.images) {
          if (Array.isArray(episode.images)) {
            epImages = [...epImages, ...episode.images];
          } else if (typeof episode.images === 'string') {
            try {
              epImages = [...epImages, ...JSON.parse(episode.images)];
            } catch {
              epImages.push(episode.images);
            }
          }
        }
        for (const img of epImages) {
          const path = extractPath(img);
          if (path) imagePathsToDelete.push(path);
        }
      }

      const episodeIds = episodes.map(e => e.id);
      const { data: episodeReels } = await supabase
        .from('reels')
        .select('thumbnail_url')
        .in('episode_id', episodeIds);
      
      if (episodeReels) {
        for (const reel of episodeReels) {
          const path = extractPath(reel.thumbnail_url);
          if (path) imagePathsToDelete.push(path);
        }
      }
    }

    if (reels) {
      for (const reel of reels) {
        const path = extractPath(reel.thumbnail_url);
        if (path) imagePathsToDelete.push(path);
      }
    }

    console.log('Image paths to delete:', imagePathsToDelete);

    if (imagePathsToDelete.length > 0) {
      const uniquePaths = [...new Set(imagePathsToDelete)];
      await supabase.storage.from('images').remove(uniquePaths);
    }

    const { data: schedules } = await supabase
      .from('schedules')
      .select('id')
      .eq('edition_id', editionId);

    if (schedules && schedules.length > 0) {
      const scheduleIds = schedules.map(s => s.id);
      if (scheduleIds.length > 0) {
        await supabase
          .from('schedule_tasks')
          .delete()
          .in('schedule_id', scheduleIds);
      }
    }

    await supabase
      .from('schedules')
      .delete()
      .eq('edition_id', editionId);

    if (episodes && episodes.length > 0) {
      const episodeIds = episodes.map(e => e.id);
      
      if (episodeIds.length > 0) {
        await supabase
          .from('questions')
          .delete()
          .in('episode_id', episodeIds);

        await supabase
          .from('episode_speakers')
          .delete()
          .in('episode_id', episodeIds);

        await supabase
          .from('reels')
          .delete()
          .in('episode_id', episodeIds);

        await supabase
          .from('episodes')
          .delete()
          .in('id', episodeIds);
      }
    }

    const { data: remainingReels } = await supabase
      .from('reels')
      .select('id')
      .eq('edition_id', editionId);

    if (remainingReels && remainingReels.length > 0) {
      await supabase
        .from('reels')
        .delete()
        .eq('edition_id', editionId);
    }

    await supabase
      .from('speakers')
      .delete()
      .eq('edition_id', editionId);

    const { error } = await supabase
      .from('editions')
      .delete()
      .eq('id', editionId);

    if (error) throw error;
    res.json({ message: 'Edition and all related data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

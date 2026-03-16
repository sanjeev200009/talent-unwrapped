import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { edition_id, episode_id } = req.query;
    let query = supabase.from('reels').select('*').order('created_at', { ascending: false });
    
    if (edition_id) {
      query = query.eq('edition_id', edition_id);
    }
    
    if (episode_id) {
      query = query.eq('episode_id', episode_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reels')
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
    const { edition_id, episode_id, title, description, views, thumbnail_url, url } = req.body;
    const { data, error } = await supabase
      .from('reels')
      .insert([{ edition_id, episode_id, title, description, views, thumbnail_url, url }])
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
    const { episode_id, title, description, views, thumbnail_url, url } = req.body;
    const { data, error } = await supabase
      .from('reels')
      .update({ 
        episode_id,
        title, 
        description, 
        views, 
        thumbnail_url, 
        url,
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
    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Reel deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { schedule_id } = req.query;
    let query = supabase.from('schedule_tasks').select('*').order('task_date', { ascending: true });
    
    if (schedule_id) {
      query = query.eq('schedule_id', schedule_id);
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
      .from('schedule_tasks')
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
    const { schedule_id, title, description, task_date, task_time } = req.body;
    const { data, error } = await supabase
      .from('schedule_tasks')
      .insert([{ schedule_id, title, description, task_date, task_time }])
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
    const { title, description, task_date, task_time } = req.body;
    const { data, error } = await supabase
      .from('schedule_tasks')
      .update({ 
        title, 
        description, 
        task_date, 
        task_time,
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
      .from('schedule_tasks')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

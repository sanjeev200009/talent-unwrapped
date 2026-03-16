import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: data.id,
        email: data.email,
        name: data.name
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data: user, error: findError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('password', currentPassword)
      .single();

    if (findError || !user) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password: newPassword })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

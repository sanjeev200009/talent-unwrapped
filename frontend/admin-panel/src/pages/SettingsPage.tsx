import React, { useState } from 'react';
import { ArrowLeft, Lock, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nigrcsprvhiaxfrrztyi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ3Jjc3BydmhpYXhmcnJ6dHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTI2OTEsImV4cCI6MjA4ODg4ODY5MX0.DJDpx5o9E1dccvA6dV8fanvsLp5IWUmZgJ5VMxHp3ZA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SettingsPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        return;
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all text-base group w-fit">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Settings
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Manage your account settings.
          </p>
        </div>
      </header>

      <section className="glass-card overflow-hidden animate-fade-in group !p-0">
        <div className="p-6 md:px-10 md:py-8 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group-hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7bb302]/10 rounded-2xl flex items-center justify-center text-[#7bb302] group-hover:scale-110 transition-transform shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Change Password</h3>
              <p className="text-muted-foreground text-sm mt-1">Update your account password</p>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-12">
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
            <div className="space-y-3">
              <label className="label">New Password</label>
              <input 
                type="password" 
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            
            <div className="space-y-3">
              <label className="label">Confirm New Password</label>
              <input 
                type="password" 
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 !px-6 !py-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /><span>Change Password</span></>}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;

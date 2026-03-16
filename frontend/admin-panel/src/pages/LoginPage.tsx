import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nigrcsprvhiaxfrrztyi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ3Jjc3BydmhpYXhmcnJ6dHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTI2OTEsImV4cCI6MjA4ODg4ODY5MX0.DJDpx5o9E1dccvA6dV8fanvsLp5IWUmZgJ5VMxHp3ZA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        localStorage.setItem('admin_user', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.email?.split('@')[0]
        }));
        navigate('/');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6 relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7bb302]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-[#7bb302]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in relative">
        <div className="glass-card !p-10 md:!p-14 border-t border-white/20">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
              <span className="text-white font-bold text-3xl">T</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">Sign in to Talent Unwrapped Admin</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@talentunwrapped.com" 
                  className="input-field !pl-12 bg-white/5 border-white/10 focus:bg-white/10" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="label !mb-0">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="input-field !pl-12 bg-white/5 border-white/10 focus:bg-white/10" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-8 group h-14">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Sign In</span><ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

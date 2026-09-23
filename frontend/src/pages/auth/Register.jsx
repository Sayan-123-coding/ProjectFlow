import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data?.user?.identities?.length === 0) {
      setError('Email address is already registered.');
      setLoading(false);
    } else {
      if (!data.session) {
        setSuccessMessage('Registration successful. Please check your email to confirm your account before logging in.');
        setLoading(false);
      } else {
        // Automatically redirects if session exists
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      
      <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 z-10">
        <div className="text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_15px_rgba(0,51,255,0.2)]">
            <svg className="w-8 h-8 text-pf-600 drop-shadow-[0_0_8px_rgba(0,51,255,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">Create an account</h2>
          <p className="mt-3 text-[15px] font-medium text-pf-200/80">Join ProjectFlow to start managing your projects</p>
        </div>
        
        {error && (
          <div className="rounded-xl bg-red-950/40 backdrop-blur-md p-4 text-sm font-semibold text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="rounded-xl bg-emerald-950/40 backdrop-blur-md p-4 text-sm font-semibold text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-pf-400 uppercase tracking-widest mb-2" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                required
                className="input-dark w-full"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-pf-400 uppercase tracking-widest mb-2" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="input-dark w-full"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-pf-400 uppercase tracking-widest mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input-dark w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3 text-[15px]"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
          
          <div className="text-center text-[13px] pt-6 border-t border-white/10 font-medium">
            <span className="text-pf-400/80">Already have an account? </span>
            <Link to="/login" className="font-bold text-pf-200 hover:text-white transition-colors ml-1 uppercase tracking-wider hover:drop-shadow-[0_0_5px_rgba(196,181,253,0.5)]">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

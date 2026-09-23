import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      // successful login will automatically trigger the AuthContext state change 
      // and redirect through the protected route logic.
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
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">Welcome back</h2>
          <p className="mt-3 text-[15px] font-medium text-pf-200/80">Sign in to your account to continue</p>
        </div>
        
        {error && (
          <div className="rounded-xl bg-red-950/40 backdrop-blur-md p-4 text-sm font-semibold text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-pf-400 uppercase tracking-widest" htmlFor="password">Password</label>
                <div className="text-[13px]">
                  <Link to="/forgot-password" className="font-bold text-pf-200 hover:text-white transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-[13px] pt-6 border-t border-white/10 font-medium">
            <span className="text-pf-400/80">Don't have an account? </span>
            <Link to="/register" className="font-bold text-pf-200 hover:text-white transition-colors ml-1 uppercase tracking-wider hover:drop-shadow-[0_0_5px_rgba(196,181,253,0.5)]">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

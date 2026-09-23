import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
    });

    if (resetError) {
      // For security, don't expose if the email exists or not unless necessary.
      // Supabase by default will just say success even if the email doesn't exist,
      // depending on project settings. If it returns an error (e.g. rate limit), show it.
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">

      <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 z-10">
        <div className="text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_15px_rgba(0,51,255,0.2)]">
            <svg className="w-8 h-8 text-pf-600 drop-shadow-[0_0_8px_rgba(0,51,255,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">Reset password</h2>
          <p className="mt-3 text-[15px] font-medium text-pf-200/80">
            Enter your email and we'll send a reset link.
          </p>
        </div>
        
        {error && (
          <div className="rounded-xl bg-red-950/40 backdrop-blur-md p-4 text-sm font-semibold text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-950/40 backdrop-blur-md p-4 text-sm font-semibold text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            Check your email for a password reset link.
          </div>
        )}

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleReset}>
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
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center py-3 text-[15px]"
              >
                {loading ? 'Sending link...' : 'Send reset link'}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center text-[13px] pt-6 border-t border-white/10 font-medium mt-6">
          <Link to="/login" className="font-bold text-pf-200 hover:text-white transition-colors flex items-center justify-center gap-2 hover:drop-shadow-[0_0_5px_rgba(196,181,253,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}

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
    <div className="flex min-h-screen items-center justify-center px-4 bg-pf-900">
      <div className="w-full max-w-md space-y-8 surface-1 p-8 sm:p-10 rounded-2xl border border-pf-800/50 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-pf-800/40 flex items-center justify-center mb-6 border border-pf-600/20 shadow-inner">
            <svg className="w-7 h-7 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-pf-100">Reset password</h2>
          <p className="mt-3 text-[15px] font-medium text-pf-400">
            Enter your email and we'll send a reset link.
          </p>
        </div>
        
        {error && (
          <div className="rounded-xl bg-[rgba(239,68,68,0.1)] p-4 text-sm font-semibold text-[rgba(248,113,113,0.9)] border border-[rgba(239,68,68,0.2)]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-[rgba(34,197,94,0.1)] p-4 text-sm font-semibold text-[rgba(74,222,128,0.9)] border border-[rgba(34,197,94,0.2)]">
            Check your email for a password reset link.
          </div>
        )}

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleReset}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-pf-200 uppercase tracking-widest mb-2" htmlFor="email">Email address</label>
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
        
        <div className="text-center text-[13px] pt-6 border-t border-pf-800/50 font-medium mt-6">
          <Link to="/login" className="font-bold text-pf-400 hover:text-pf-200 transition-colors flex items-center justify-center gap-2">
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

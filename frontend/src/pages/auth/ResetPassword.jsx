import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify if we have a recovery session from the URL hash
    // Gotrue automatically processes the URL hash and establishes a session if the token is valid.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If there is no session, the link is invalid, expired, or they navigated here directly without a token.
      if (!session) {
        setSessionError(true);
      }
    };
    
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      // Success! Password updated. The AuthContext should see a SIGNED_IN event,
      // but we will safely navigate to dashboard.
      navigate('/dashboard', { replace: true });
    }
  };

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">

        <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 text-center z-10">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-900/40 flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <svg className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">Invalid link</h2>
          <p className="mt-3 text-[15px] font-medium text-pf-200/80">
            The password reset link is invalid, expired, or has already been used. Please request a new one.
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/forgot-password')}
              className="btn-primary w-full flex justify-center py-3 text-[15px]"
            >
              Request new link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">


      <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 z-10">
        <div className="text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_15px_rgba(0,51,255,0.2)]">
            <svg className="w-8 h-8 text-pf-600 drop-shadow-[0_0_8px_rgba(0,51,255,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">Set new password</h2>
          <p className="mt-3 text-[15px] font-medium text-pf-200/80">
            Please enter your new password below.
          </p>
        </div>
        
        {error && (
          <div className="rounded-xl bg-red-950/40 backdrop-blur-md p-4 text-sm font-semibold text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-pf-400 uppercase tracking-widest mb-2" htmlFor="password">New Password</label>
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
            <div>
              <label className="block text-sm font-bold text-pf-400 uppercase tracking-widest mb-2" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="input-dark w-full"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3 text-[15px]"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

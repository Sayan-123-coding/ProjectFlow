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
      <div className="flex min-h-screen items-center justify-center px-4 bg-pf-900">
        <div className="w-full max-w-md space-y-8 surface-1 p-8 sm:p-10 rounded-2xl text-center border border-pf-800/50 shadow-2xl">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[rgba(239,68,68,0.1)] flex items-center justify-center mb-6 border border-[rgba(239,68,68,0.2)] shadow-inner">
            <svg className="w-7 h-7 text-[rgba(248,113,113,0.9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-pf-100">Invalid link</h2>
          <p className="mt-3 text-[15px] font-medium text-pf-400">
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
    <div className="flex min-h-screen items-center justify-center px-4 bg-pf-900">
      <div className="w-full max-w-md space-y-8 surface-1 p-8 sm:p-10 rounded-2xl border border-pf-800/50 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-pf-800/40 flex items-center justify-center mb-6 border border-pf-600/20 shadow-inner">
            <svg className="w-7 h-7 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-pf-100">Set new password</h2>
          <p className="mt-3 text-[15px] font-medium text-pf-400">
            Please enter your new password below.
          </p>
        </div>
        
        {error && (
          <div className="rounded-xl bg-[rgba(239,68,68,0.1)] p-4 text-sm font-semibold text-[rgba(248,113,113,0.9)] border border-[rgba(239,68,68,0.2)]">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-pf-200 uppercase tracking-widest mb-2" htmlFor="password">New Password</label>
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
              <label className="block text-sm font-bold text-pf-200 uppercase tracking-widest mb-2" htmlFor="confirmPassword">Confirm Password</label>
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

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const [userRes, profileRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/profile')
      ]);
      setUser(userRes.user);
      setProfile(profileRes.profile);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      
      if (session) {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          await loadUserData();
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (session) {
      try {
        const profileRes = await api.get('/profile');
        setProfile(profileRes.profile);
      } catch (err) {
        console.error('Failed to refresh profile', err);
      }
    }
  };

  const updateLocalProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    updateLocalProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

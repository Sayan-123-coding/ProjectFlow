import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profile.service';

export default function ProfileSettings() {
  const { user, profile, updateLocalProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: ''
  });
  
  const [initialData, setInitialData] = useState({
    full_name: '',
    avatar_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const { profile: data } = await profileService.getProfile();
        
        if (isMounted && data) {
          const profileData = {
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || ''
          };
          setFormData(profileData);
          setInitialData(profileData);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load profile data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [success]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = formData.full_name.trim();
    if (!trimmedName) {
      setError('Full Name cannot be empty.');
      return;
    }

    if (formData.avatar_url && formData.avatar_url.trim()) {
      try {
        new URL(formData.avatar_url.trim());
      } catch (err) {
        setError('Avatar URL must be a valid URL or empty.');
        return;
      }
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const updateData = {
        fullName: trimmedName,
        avatarUrl: formData.avatar_url.trim() || null
      };

      const { profile: updatedProfile } = await profileService.updateProfile(updateData);
      
      // Update local state to reflect new saved state
      const newProfileData = {
        full_name: updatedProfile.full_name || '',
        avatar_url: updatedProfile.avatar_url || ''
      };
      
      setFormData(newProfileData);
      setInitialData(newProfileData);
      setSuccess(true);
      
      // Update AuthContext so changes reflect globally (e.g. AppLayout)
      updateLocalProfile(updatedProfile);
      
    } catch (err) {
      setError(err.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 relative z-10">
      <div className="md:flex md:items-center md:justify-between pb-5 relative">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-pf-600/50 via-pf-400/20 to-transparent"></div>
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-extrabold leading-tight text-slate-800 sm:truncate tracking-wide">
            Profile Settings
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-6 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-extrabold leading-7 text-slate-700">Personal Information</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
            Update your personal details and how you appear to other members.
          </p>
        </div>

        <div className="glass-panel sm:rounded-2xl md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-pf-600 to-transparent"></div>
          <form onSubmit={handleSubmit} className="px-5 py-6 sm:p-8 space-y-6 relative z-10">
            
            {error && (
              <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-4 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                <p className="text-sm font-bold text-red-400 drop-shadow-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="rounded-xl bg-green-950/40 border border-green-500/30 p-4 backdrop-blur-md shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                <p className="text-sm font-bold text-green-400 drop-shadow-sm">Profile updated successfully.</p>
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="block text-sm font-bold leading-6 text-pf-400 uppercase tracking-widest drop-shadow-sm">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={saving}
                  maxLength={100}
                  className="input-dark mt-2 w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="avatar_url" className="block text-sm font-bold leading-6 text-pf-400 uppercase tracking-widest drop-shadow-sm">
                Avatar URL
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="avatar_url"
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="https://example.com/avatar.jpg"
                  className="input-dark mt-2 w-full"
                />
              </div>
              <p className="mt-2 text-xs font-medium text-pf-600/70">Provide an optional URL for your profile picture.</p>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 drop-shadow-sm">Account Information</h3>
              <div>
                <label className="block text-sm font-bold leading-6 text-pf-400 uppercase tracking-widest drop-shadow-sm">
                  Email Address
                </label>
                <div className="mt-2">
                  <p className="text-[15px] text-white font-bold tracking-wide">{user?.email}</p>
                  <p className="text-xs font-medium text-pf-600/70 mt-2">Email changes are not available here.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6 pt-5 border-t border-white/10">
              <button
                type="submit"
                disabled={!hasChanges || saving}
                className="btn-primary w-full sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

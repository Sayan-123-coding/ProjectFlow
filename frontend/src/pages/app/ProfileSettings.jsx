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
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Profile Settings
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-6 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Update your personal details and how you appear to other members.
          </p>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <form onSubmit={handleSubmit} className="px-4 py-6 sm:p-8 space-y-6">
            
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-700">Profile updated successfully.</p>
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-gray-900">
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium leading-6 text-gray-900">
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Provide an optional URL for your profile picture.</p>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Account Information</h3>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-500">
                  Email Address
                </label>
                <div className="mt-1">
                  <p className="text-sm text-gray-900 font-medium">{user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email changes are not available here.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={!hasChanges || saving}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

"use client";
import React, { useEffect, useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/authContext';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import ThemeSelector from '../../../components/themeSelector/themeSelector';
import toast from 'react-hot-toast';
import { changePasswordSchema, settingsSchema } from '../../../schema/settingsSchema';
import GetAvatar from '../../../customHooks/useGetAvatar';
import { Camera } from '@solar-icons/react';
import {
  APP_PREFERENCE_KEYS,
  DEFAULT_LANDING_PAGE_OPTIONS,
  getDefaultLandingPage,
  getStoredTimezone,
  getTimezoneOptions,
  setStoredPreference,
  shouldConfirmBeforeDeletingTasks,
} from '../../../helpers/appPreferences';

const accentOptions = [
  { label: 'Green', value: '#45b44b' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Violet', value: '#8b5cf6' },
];

export default function SettingsPage() {
  const { user, updateProfile, updateAvatar, changePassword, loading, logOut } = useUser();
  const navigate = useNavigate();
  const initialName = String((user as any)?.name || '');
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('General');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#45b44b');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');
  const [timezone, setTimezone] = useState(() => getStoredTimezone());
  const [defaultLandingPage, setDefaultLandingPage] = useState(() => getDefaultLandingPage());
  const [confirmBeforeDelete, setConfirmBeforeDelete] = useState(() => shouldConfirmBeforeDeletingTasks());

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-density', compactMode ? 'compact' : 'comfortable');
    localStorage.setItem('compactMode', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    setStoredPreference(APP_PREFERENCE_KEYS.timezone, timezone);
  }, [timezone]);

  useEffect(() => {
    setStoredPreference(APP_PREFERENCE_KEYS.defaultLandingPage, defaultLandingPage);
  }, [defaultLandingPage]);

  useEffect(() => {
    setStoredPreference(APP_PREFERENCE_KEYS.confirmBeforeDeletingTasks, String(confirmBeforeDelete));
  }, [confirmBeforeDelete]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Unable to read the selected file'));
      reader.readAsDataURL(file);
    });

  const handleSave = async (values: { name: string }, helpers: any) => {
    helpers.setSubmitting(true);
    try {
      const { name } = values;
      let nextPhotoUrl = currentPhotoUrl;
      if (selectedPhoto) {
        setPhotoLoading(true);
        nextPhotoUrl = await updateAvatar(selectedPhoto);
        setCurrentPhotoUrl(nextPhotoUrl);
      }

      await updateProfile({
        name,
        photoUrl: nextPhotoUrl,
      });

      setSelectedPhoto(null);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setPhotoLoading(false);
      helpers.setSubmitting(false);
    }
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedPhoto(file);

    if (!file) {
      setPreviewUrl(currentPhotoUrl);
      return;
    }

    const nextPreview = await readFileAsDataUrl(file);
    setPreviewUrl(nextPreview);
  };

  const initials = String(user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="bg-white dark:bg-dark-bg p-4 md:m-0 mx-4 rounded-lg border border-gray-200 dark:border-gray-500/[0.2]">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      <div className='flex gap-6 border-b border-gray-500/[0.1] flex-1'>
        {
          ["General", "Profile", "Notifications", "Appearance" ].map((tab) => (
              <button key={tab} onClick={() => setSelectedTab(tab)} className={`py-2 px-1 text-sm capitalize rounded-tl rounded-tr ${tab === selectedTab ? 'border-b border-primary text-primary' : 'text-gray-500'}`}>
                {tab}
              </button>
            )
          )
        }
        </div>
      <div className="mt-6">
          {selectedTab === "General" && (
            <div className="max-w-2xl mx-auto grid gap-6">
              <div className="border border-gray-500/[0.2] rounded-xl p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">General</h3>
                  <p className="text-sm text-gray-500">Keep only essential app preferences.</p>
                </div>

                <div className="grid gap-5">
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(event) => setTimezone(event.target.value)}
                      className="w-full rounded-lg border border-gray-500/[0.2] bg-white dark:bg-dark-bg px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {getTimezoneOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Default landing page</label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {DEFAULT_LANDING_PAGE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDefaultLandingPage(option.value)}
                          className={`rounded-lg border px-4 py-3 text-left transition-colors ${defaultLandingPage === option.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-500/[0.2] hover:border-gray-400'}`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">Opens {option.label.toLowerCase()} first</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-500/[0.2] p-4">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Confirm before deleting tasks</label>
                      <p className="text-xs text-gray-400">Turn this off to delete tasks immediately from swipe actions and task menus.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmBeforeDelete((current) => !current)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${confirmBeforeDelete ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                      aria-pressed={confirmBeforeDelete}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${confirmBeforeDelete ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-500/[0.2] p-4">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Logout</label>
                      <p className="text-xs text-gray-400">End your current session on this device.</p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        await logOut();
                        navigate('/auth/waitlist');
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        {
          selectedTab === "Profile" && 
          <div className="max-w-2xl mx-auto py-10">
            <div className="mb-6 flex items-center gap-4  border border-gray-500/[0.2] rounded-xl p-6">
              {previewUrl ? (
                <div className='relative'>
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-500/[0.2]"
                />
                  <label htmlFor="profile_image" className='absolute -bottom-2 -right-1 cursor-pointer border border-gray-200 dark:border-gray-500/[0.2] rounded-full p-1 bg-white dark:bg-gray-800'><Camera size={16} /></label>
                </div>
              ) : (
                <div className='relative'>
                  <GetAvatar email={user?.email} className='w-16 h-16' />
                  <label htmlFor="profile_image" className='absolute -bottom-2 -right-1 cursor-pointer border border-gray-200 dark:border-gray-500/[0.2] rounded-full p-1 bg-white dark:bg-gray-800'><Camera size={16} /></label>
                </div>
              )}

              <label htmlFor="profile_image" className="flex-1">
                <span className="text-sm text-gray-600 block mb-1">Profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  id='profile_image'
                  onChange={handlePhotoSelect}
                  className="hidden w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                />
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WebP. The image is uploaded to Cloudinary.</p>
              </label>
            </div>
            <Formik
              initialValues={{ name: initialName }}
              validationSchema={settingsSchema}
              onSubmit={handleSave}
            >
              {({ values, handleChange, isSubmitting }) => (
                <Form>

                  <div className="mb-4">
                    <label className="text-sm text-gray-600 block mb-1">Display name</label>
                    <Input name="name" value={values.name} onChange={handleChange} placeholder="Your display name" />
                    <div className="text-xs text-red-500 mt-1"><ErrorMessage name="name" /></div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-600 block mb-1">Email</label>
                    <Input value={user?.email || ''} readOnly />
                    <p className="text-xs text-gray-400 mt-1">Contact support to change your email.</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => { /* reset via formik - reload page to original */ window.location.reload(); }}>Reset</Button>
                    <Button type="submit" disabled={isSubmitting || photoLoading || loading}>{isSubmitting || photoLoading || loading ? 'Saving...' : 'Save changes'}</Button>
                  </div>
                </Form>
              )}
            </Formik>

            <div className="mt-8 border border-gray-500/[0.2] rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Change password</h3>
              <Formik
                initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
                validationSchema={changePasswordSchema}
                onSubmit={async (values, helpers) => {
                  helpers.setSubmitting(true);
                  try {
                    await changePassword(values.currentPassword, values.newPassword);
                    helpers.resetForm();
                  } catch (error: any) {
                    toast.error(error?.message || 'Failed to update password');
                  } finally {
                    helpers.setSubmitting(false);
                  }
                }}
              >
                {({ values, handleChange, isSubmitting }) => (
                  <Form className="grid gap-4">
                    <div>
                      <Input
                        name="currentPassword"
                        type="password"
                        label="Current password"
                        value={values.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter your current password"
                      />
                      <div className="text-xs text-red-500 mt-1"><ErrorMessage name="currentPassword" /></div>
                    </div>

                    <div>
                      <Input
                        name="newPassword"
                        type="password"
                        label="New password"
                        value={values.newPassword}
                        onChange={handleChange}
                        placeholder="Enter a new password"
                      />
                      <div className="text-xs text-red-500 mt-1"><ErrorMessage name="newPassword" /></div>
                    </div>

                    <div>
                      <Input
                        name="confirmPassword"
                        type="password"
                        label="Confirm new password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter the new password"
                      />
                      <div className="text-xs text-red-500 mt-1"><ErrorMessage name="confirmPassword" /></div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting || loading}>{isSubmitting || loading ? 'Updating...' : 'Update password'}</Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        }
        {selectedTab === "Notifications" && null}
        {
          selectedTab === "Appearance" && 
          
          <div className="mb-4 max-w-2xl mx-auto grid gap-6">
            <div className="border border-gray-500/[0.2] rounded-xl p-6">
              <label className="text-sm text-gray-600 block mb-4">Theme</label>
              <div className="flex items-center gap-3">
                <ThemeSelector />
              </div>
            </div>

            <div className="border border-gray-500/[0.2] rounded-xl p-6">
              <label className="text-sm text-gray-600 block mb-4">Accent color</label>
              <div className="flex flex-wrap gap-3">
                {accentOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAccentColor(option.value)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all ${accentColor === option.value ? 'border-primary ring-2 ring-primary/20' : 'border-gray-500/[0.2]'}`}
                  >
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: option.value }} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gray-500/[0.2] rounded-xl p-6 flex items-center justify-between gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Compact mode</label>
                <p className="text-xs text-gray-400">Reduce overall spacing and typography size across the app.</p>
              </div>
              <button
                type="button"
                onClick={() => setCompactMode((current) => !current)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${compactMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                aria-pressed={compactMode}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        }
      </div>
      
    </div>
  );
}

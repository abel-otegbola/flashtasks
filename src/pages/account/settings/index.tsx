"use client";
import React, { useEffect, useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { useUser } from '../../../context/authContext';
import { account, tablesDB } from '../../../appwrite/appwrite';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import ThemeSelector from '../../../components/themeSelector/themeSelector';
import toast from 'react-hot-toast';
import { settingsSchema } from '../../../schema/settingsSchema';

export default function SettingsPage() {
  const { user, setPopup } = useUser();
  const initialName = String((user as any)?.name || '');
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!user?.email) return;

      try {
        const response = await tablesDB.listRows({
          databaseId: import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || 'YOUR_DATABASE_ID',
          tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
        });

        const profileRow = response.rows?.find((row: any) =>
          row.email?.toLowerCase?.() === user.email?.toLowerCase?.() || row.$id === (user as any)?.$id
        );

        const photoUrl = profileRow?.photoUrl || '';
        setCurrentPhotoUrl(photoUrl);
        setPreviewUrl(photoUrl);
      } catch (error) {
        console.warn('Failed to load profile photo', error);
      }
    };

    loadProfilePhoto();
  }, [user?.$id, user?.email]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Unable to read the selected file'));
      reader.readAsDataURL(file);
    });

  const uploadPhotoToCloudinary = async (file: File) => {
    const fileData = await readFileAsDataUrl(file);
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: fileData,
        fileName: file.name,
        folder: import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER || 'profile-photos',
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error || 'Failed to upload image');
    }

    return String(payload?.secure_url || '');
  };

  const persistUserRow = async (data: { name: string; photoUrl: string }) => {
    if (!user?.email) return;

    const response = await tablesDB.listRows({
      databaseId: import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || 'YOUR_DATABASE_ID',
      tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
    });

    const existingRow = response.rows?.find((row: any) =>
      row.email?.toLowerCase?.() === user.email?.toLowerCase?.() || row.$id === (user as any)?.$id
    );

    const rowId = existingRow?.$id || (user as any)?.$id;

    if (existingRow?.$id) {
      await tablesDB.updateRow({
        databaseId: import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || 'YOUR_DATABASE_ID',
        tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
        rowId,
        data: {
          name: data.name,
          photoUrl: data.photoUrl,
        },
      });
      return;
    }

    await tablesDB.createRow({
      databaseId: import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || 'YOUR_DATABASE_ID',
      tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
      rowId,
      data: {
        email: user.email,
        name: data.name,
        photoUrl: data.photoUrl,
      },
    });
  };

  const handleSave = async (values: { name: string }, helpers: any) => {
    helpers.setSubmitting(true);
    try {
      const { name } = values;

      if (name && name !== user?.name) {
        // Appwrite Account SDK: updateName
        // @ts-ignore
        await account.updateName(name);
      }

      let nextPhotoUrl = currentPhotoUrl;
      if (selectedPhoto) {
        setPhotoLoading(true);
        nextPhotoUrl = await uploadPhotoToCloudinary(selectedPhoto);
        setCurrentPhotoUrl(nextPhotoUrl);
      }

      await persistUserRow({
        name,
        photoUrl: nextPhotoUrl,
      });

      // Refresh session user and update app state
      try {
        const refreshed = await account.get();
        try { localStorage.setItem('user', JSON.stringify(refreshed)); } catch {}
        setSelectedPhoto(null);
        setPopup({ type: 'success', msg: 'Profile updated' });
        // reload so AuthProvider picks up the new account data
        window.location.reload();
      } catch (e) {
        console.warn('Failed to refresh user after update', e);
        setPopup({ type: 'success', msg: 'Profile updated' });
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setPopup({ type: 'error', msg: err?.message || 'Failed to update profile' });
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

      <div className="">
        <h2 className="text-lg font-medium mb-3">Profile</h2>
        <Formik
          initialValues={{ name: initialName }}
          validationSchema={settingsSchema}
          onSubmit={handleSave}
        >
          {({ values, handleChange, isSubmitting }) => (
            <Form>
              <div className="mb-6 flex items-center gap-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-500/[0.2]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-gray-500/[0.2] flex items-center justify-center text-xl font-semibold text-gray-500">
                    {initials}
                  </div>
                )}

                <div className="flex-1">
                  <label className="text-sm text-gray-600 block mb-1">Profile photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                  />
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WebP. The image is uploaded to Cloudinary.</p>
                </div>
              </div>

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

        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-4">Theme</label>
          <div className="flex items-center gap-3">
            <ThemeSelector />
          </div>
        </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => { /* reset via formik - reload page to original */ window.location.reload(); }}>Reset</Button>
                <Button type="submit" disabled={isSubmitting || photoLoading}>{isSubmitting || photoLoading ? 'Saving...' : 'Save changes'}</Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

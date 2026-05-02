"use client";
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useUser } from '../../../context/authContext';
import { account } from '../../../appwrite/appwrite';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import ThemeSelector from '../../../components/themeSelector/themeSelector';
import toast from 'react-hot-toast';
import { settingsSchema } from '../../../schema/settingsSchema';

export default function SettingsPage() {
  const { user, setPopup } = useUser();
  const initialName = String((user as any)?.name || '');

  const handleSave = async (values: { name: string }, helpers: any) => {
    helpers.setSubmitting(true);
    try {
      const { name } = values;
      if (name && name !== user?.name) {
        // Appwrite Account SDK: updateName
        // @ts-ignore
        await account.updateName(name);
      }

      // Refresh session user and update app state
      try {
        const refreshed = await account.get();
        try { localStorage.setItem('user', JSON.stringify(refreshed)); } catch {}
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
      helpers.setSubmitting(false);
    }
  };

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
                <Button variant="secondary" onClick={() => { /* reset via formik - reload page to original */ window.location.reload(); }}>Reset</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save changes'}</Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

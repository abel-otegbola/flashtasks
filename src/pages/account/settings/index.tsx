"use client";
import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { useUser } from '../../../context/authContext';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import ThemeSelector from '../../../components/themeSelector/themeSelector';
import { settingsSchema } from '../../../schema/settingsSchema';
import GetAvatar from '../../../customHooks/useGetAvatar';

export default function SettingsPage() {
  const { user, uploadAvatar, updateProfile } = useUser();
  const initialName = String((user as any)?.name || '');
  const [selectedTab, setSelectedTab] = useState("Tasks");

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    uploadAvatar(file as File)
  };

  return (
    <div className="bg-white dark:bg-dark-bg p-4 md:m-0 mx-4 rounded-lg border border-gray-200 dark:border-gray-500/[0.2]">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      <div className='flex gap-6 border-b border-gray-500/[0.1] flex-1'>
        {
          ["General", "Profile", "Notifications", "Themes" ].map((tab) => (
              <button key={tab} onClick={() => setSelectedTab(tab)} className={`py-2 px-1 text-sm capitalize rounded-tl rounded-tr ${tab === selectedTab ? 'border-b border-primary text-primary' : 'text-gray-500'}`}>
                {tab}
              </button>
            ))
        }
        </div>

      <div className="">
        <h2 className="text-lg font-medium mb-3">Profile</h2>
        <div className="mb-6 flex items-center gap-4">
          <GetAvatar email={user?.email || ""} className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-500/[0.2]" />

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
        <Formik
          initialValues={{ name: initialName, email: user?.email || '' }}
          validationSchema={settingsSchema}
          onSubmit={updateProfile}
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
                <Button type="button" variant="secondary" onClick={() => { /* reset via formik - reload page to original */ window.location.reload(); }}>Reset</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save changes'}</Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

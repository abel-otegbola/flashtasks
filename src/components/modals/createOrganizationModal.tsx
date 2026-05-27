'use client'
import React, { useEffect, useState } from 'react';
import Button from '../button/button';
import Input from '../input/input';
import { CreateOrganizationPayload, OrgMember } from '../../interface/organization';
import { ID } from 'appwrite';
import { Formik } from 'formik';
import { createOrganizationSchema } from '../../schema/organizationSchema';
import { useOrganizations } from '../../context/organizationContext';
import { useUser } from '../../context/authContext';
import { CloseCircle } from '@solar-icons/react';
import LoadingIcon from '../../assets/icons/loading';
import { XIcon } from '@phosphor-icons/react';
import TagInput from '../input/tagInput';
import { useOutsideClick } from '../../customHooks/useOutsideClick';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateOrganizationModal({ isOpen, onClose }: Props) {
  const { createOrganization, loading } = useOrganizations();
  const modalRef = useOutsideClick(onClose, false)

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white dark:bg-dark shadow-xl w-[94%] max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-500/[0.2] rounded-lg overflow-hidden">
        <div className="sticky top-0 bg-white dark:bg-dark border-b border-gray-500/[0.1] z-[2] p-4 flex items-center justify-between">
          <h2 className="px-2 opacity-[0.7] leading-4">Create organization</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors">
            <XIcon size={16} />
          </button>
        </div>
        <Formik
            initialValues={{ name: '' }}
            validationSchema={createOrganizationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const payload: CreateOrganizationPayload = {
                name: values.name.trim(),
              };
              await createOrganization(payload);
              onClose();
              setSubmitting(false);
            }}
            >
            {({ isSubmitting, handleSubmit, errors, touched, values, handleChange }) => (
                <form onSubmit={handleSubmit} className='flex flex-col justify-between h-full'>
                    <div className="p-6 space-y-3">
                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                            <Input value={values.name} name='name' onChange={handleChange} placeholder="Organization name" error={touched.name ? errors.name : ""} />
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white dark:bg-dark border-t border-gray-500/[0.2] p-6 py-4 flex justify-center gap-3">
                        <Button variant='secondary' onClick={onClose} size='small'>Close</Button>
                        <Button type='submit' size='small' disabled={loading}>{isSubmitting || loading ? <LoadingIcon className='animate-spin' /> : 'Create Organization'}</Button>
                    </div>
                </form>
            )}
        </Formik>
      </div>
    </div>
  )
}

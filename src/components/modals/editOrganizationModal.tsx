'use client'
import React, { useEffect, useState } from 'react';
import Button from '../button/button';
import Input from '../input/input';
import { CreateOrganizationPayload, Organization, OrgMember, Team } from '../../interface/organization';
import { ID } from 'appwrite';
import { useOrganizations } from '../../context/organizationContext';
import { CloseCircle } from '@solar-icons/react';
import { XIcon } from '@phosphor-icons/react';
import { Formik } from 'formik';
import { createOrganizationSchema } from '../../schema/organizationSchema';
import TagInput from '../input/tagInput';
import { useUser } from '../../context/authContext';
import LoadingIcon from '../../assets/icons/loading';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  org?: Organization | null;
}

export default function EditOrganizationModal({ isOpen, onClose, org }: Props) {
  const { updateOrganization, loading } = useOrganizations();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string>('');
  const [teams, setTeams] = useState<string>('');
  const { user } = useUser();
  const ownerEmail = (user as any)?.email;

  useEffect(() => {
    if (!org) return;
    setName(org.name || '');
    setDescription(org.description || '');
    setMembers((org.members || []).map(m => m.email).join(', '));
    setTeams((org.teams || []).map(t => t.name).join(', '));
  }, [org]);

  if (!isOpen || !org) return null;

 const parseMembers = (): OrgMember[] => {
    if (!members.trim()) return [];
    return members.split(',').map(s => {
      const email = s.trim();
      return { $id: ID.unique(), email, name: email.split('@')[0], role: 'member' } as OrgMember;
    });
  }

  // Ensure owner is not removed if provided in the members input
  const parseMembersExcludingOwner = (): OrgMember[] => {
    const all = parseMembers();
    if (!ownerEmail) return all;
    return all.filter(m => m.email !== ownerEmail);
  }

  const parseTeams = () => {
    if (!teams.trim()) return [];
    return teams.split(',').map(s => ({ name: s.trim() }));
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#0b0b0b] shadow-xl w-[94%] max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-500/[0.2] rounded-lg overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-[#0b0b0b] border-b border-gray-500/[0.1] z-[2] p-4 flex items-center justify-between">
              <h2 className="px-2 opacity-[0.7] leading-4">Edit organization</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors">
                <XIcon size={16} />
              </button>
            </div>
            <Formik
                initialValues={{ name: name, description: description }}
                validationSchema={createOrganizationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  const payload: CreateOrganizationPayload = {
                    name: values.name.trim(),
                    description: values.description.trim(),
                    // exclude owner from the explicit members list; orgContext will ensure owner is added as owner
                    members: parseMembersExcludingOwner(),
                    teams: parseTeams()
                  };
                  await updateOrganization(org.$id, payload);
                  onClose();
                  setSubmitting(false);
                }}
                >
                {({ isSubmitting, handleSubmit, errors, touched, values, handleChange }) => (
                    <form onSubmit={handleSubmit} className='flex flex-col justify-between h-full'>
                        <div className="p-6 space-y-6 overflow-y-auto pb-24">
                            <div className='flex flex-col gap-2'>
                                <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                                <Input value={values.name} name='name' onChange={handleChange} placeholder="Organization name" error={touched.name ? errors.name : ""} />
                            </div>
    
                            <div className='flex flex-col gap-2'>
                                <label className="text-sm font-medium">Description</label>
                                <textarea value={values.description} name='description' onChange={handleChange} className="w-full p-2 rounded-md border border-gray-500/[0.2] bg-white dark:bg-dark-bg outline-none" />
                                {touched.description && errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
                            </div>
    
                            <div className='flex flex-col gap-2'>
                                <label className="text-sm font-medium">Members (comma-separated emails)</label>
                                <TagInput tags={members} onChange={(e) => setMembers(e.toString())} />
                                <div className="text-xs text-gray-500">Do not include your email here — you'll be added automatically as owner.</div>
                            </div>
    
                            <div className='flex flex-col gap-2'>
                                <label className="text-sm font-medium">Teams (comma-separated names)</label>
                                <TagInput tags={teams} onChange={(e) => setTeams(e.toString())} />
                            </div>
                        </div>
    
                        <div className="sticky bottom-0 bg-white dark:bg-[#0b0b0b] border-t border-gray-500/[0.2] p-6 py-4 flex justify-end gap-3">
                            <Button variant='secondary' onClick={onClose}>Close</Button>
                            <Button type='submit' disabled={loading}>{isSubmitting || loading ? <LoadingIcon className='animate-spin' /> : 'Update Organization'}</Button>
                        </div>
                    </form>
                )}
            </Formik>
          </div>
        </div>
  );
}

'use client';
import { todo } from "../../interface/todo";
import { useOrganizations } from '../../context/organizationContext';
import Button from "../button/button";
import { useUser } from "../../context/authContext";
import { XIcon } from "@phosphor-icons/react";
import { Formik } from "formik";
import Input from "../input/input";
import TagInput from "../input/tagInput";
import LoadingIcon from "../../assets/icons/loading";
import { useTasks } from "../../context/tasksContext";
import { Organization } from "../../interface/organization";
import { createTaskSchema } from '../../schema/createTaskSchema';
import DueDateTimePicker from "../input/dueDateTimePicker";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: todo | null;
}

export default function EditTaskModal({ 
  isOpen, 
  onClose, 
  task,
}: EditTaskModalProps) {

  const { organizations } = useOrganizations();
  const { updateTask, loading } = useTasks();
  const { user } = useUser();

  const toDateTimeLocalValue = (value?: string) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-end z-50">
      <div className="bg-white dark:bg-[#0b0b0b] shadow-xl w-full max-w-xl h-screen border-l border-gray-500/[0.2] shadow-lg">
        <div className="sticky top-0 bg-white dark:bg-[#0b0b0b] border-b border-gray-500/[0.2] z-[2] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors">
              <XIcon size={16} />
            </button>
            <h2 className="px-4 border-l border-gray-500/[0.1] opacity-[0.7] leading-4">Update Current Task</h2>
          </div>
        </div>
        <Formik
          initialValues={{ title: task?.title || '', description: task?.description || '', category: task?.category || '', assignees: task?.assignees || [], invites: task?.invites?.join(',') || '', organizationId: task?.organizationId || '', teamId: task?.teamId || '', status: task?.status || 'upcoming', priority: task?.priority || 'medium', dueDate: toDateTimeLocalValue(task?.dueDate), comments: task?.comments || '' }}
          validationSchema={createTaskSchema}
          enableReinitialize
            onSubmit={async (values, { setSubmitting }) => {
              await updateTask(task?.$id || "", {...values, userEmail: user?.email || '', userId: user?._id?.toString() || '', invites: values.invites.split(","), assignees: values.assignees, status: values.status as todo["status"], priority: values.priority as todo["priority"]});
              onClose();
              setSubmitting(false);
            }}
            >
            {({ isSubmitting, handleSubmit, errors, touched, values, setFieldValue, handleChange }) => (
                <form onSubmit={handleSubmit} className='flex flex-col justify-between h-full'>
                    <div className="p-6 space-y-6 overflow-y-auto pb-24">
                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                            <Input value={values.title} name='title' onChange={handleChange} placeholder="Task title" error={touched.title ? errors.title : ""} />
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Description</label>
                            <textarea value={values.description} name='description' onChange={handleChange} className="w-full p-4 rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] outline-none" />
                            {touched.description && errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                            <Input value={values.category} name='category' onChange={handleChange} placeholder="Task category" error={touched.category ? errors.category : ""} />
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                            <select value={values.status} name='status' onChange={handleChange} className="w-full p-4 rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] outline-none">
                                <option value="upcoming">Upcoming</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        
                        <DueDateTimePicker
                          value={values.dueDate}
                          onChange={(nextValue) => setFieldValue('dueDate', nextValue)}
                          required
                          error={touched.dueDate ? errors.dueDate : ''}
                        />

                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Priority <span className="text-red-500">*</span></label>
                            <select value={values.priority} name='priority' onChange={handleChange} className="w-full p-4 rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] outline-none">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Invites</label>
                            <TagInput tags={values.invites} onChange={(e) => setFieldValue('invites', e.toString())} placeholder="Add emails to invite to the task" />
                        </div>
                         
                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Add to an organization</label>
                            <select value={values.organizationId} name='organizationId' onChange={handleChange} className="w-full p-4 rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] outline-none">
                                <option value="">Select an organization</option>
                                {organizations.map((org: any) => (
                                    <option key={org.$id} value={org.$id}>{org.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className="text-sm font-medium">Assignees</label>
                            <TagInput tags={values.assignees} onChange={(e) => setFieldValue('assignees', e)} placeholder="Assign the task to members" />
                            <select onChange={(e) => setFieldValue('assignees', (values.assignees).includes(e.target.value) ? values.assignees : [...values.assignees, e.target.value])} className="w-full p-2 rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] outline-none">
                              <option value="">Select a member</option>
                              {
                                (
                                  (organizations.find((org: Organization) => org.$id === values.organizationId)?.members ?? [])
                                  .concat(values.invites ? values.invites.split(",").filter(Boolean).map((email: string) => ({ $id: email, email, name: email })) : [])
                                ).map((member: any) => (
                                  <option key={member.$id} value={member.email}>{member.name}</option>
                                ))
                              }
                            </select>
                        </div>

                    </div>

                    <div className="sticky bottom-0 bg-white dark:bg-[#0b0b0b] border-t border-gray-500/[0.2] p-6 flex justify-end gap-3">
                        <Button variant='secondary' onClick={onClose}>Close</Button>
                        <Button type='submit' disabled={loading}>{isSubmitting || loading ? <LoadingIcon className='animate-spin' /> : 'Save'}</Button>
                    </div>
                </form>
            )}
        </Formik>
      </div>
    </div>
  );
}

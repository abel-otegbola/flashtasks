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
import { useOutsideClick } from "../../customHooks/useOutsideClick";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (task: Omit<todo, '$id' | 'id' | '$createdAt'>) => void;
  onUpdate?: (taskId: string, updates: Partial<todo>) => void;
  onDelete?: (taskId: string) => void;
  task?: todo | null; // If task is provided, we're in edit mode
  mode?: 'add' | 'edit';
}

export default function CreateTaskModal({ 
  isOpen, 
  onClose, 
}: AddTaskModalProps) {

  const { organizations } = useOrganizations();
  const { addTask, loading } = useTasks();
  const { user } = useUser();
  const modalRef = useOutsideClick(onClose, false)

  const getLocalDateTimeValue = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white dark:bg-dark-bg shadow-xl w-[94%] max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-500/[0.2] rounded-lg overflow-hidden">
        <div className="sticky top-0 bg-white dark:bg-dark-bg border-b border-gray-500/[0.1] z-[2] p-4 flex items-center justify-between">
            <h2 className="px-2 opacity-[0.7] leading-4">Create New Task</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors">
              <XIcon size={16} />
            </button>
        </div>
        <Formik
          initialValues={{ title: '', description: '', category: '', assignees: [] as string[], invites: '', organizationId: '', teamId: '', status: 'upcoming', priority: 'medium', dueDate: getLocalDateTimeValue(), comments: '' }}
          enableReinitialize
          validationSchema={createTaskSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await addTask({...values, userEmail: user?.email || '', userId: user?._id?.toString() || '', invites: values.invites.split(","), assignees: values.assignees, status: values.status as todo["status"], priority: values.priority as todo["priority"]});
              onClose();
              setSubmitting(false);
            }}
            >
            {({ isSubmitting, handleSubmit, errors, touched, values, setFieldValue, handleChange }) => (
                <form onSubmit={handleSubmit} className='flex flex-col justify-between h-full'>
                  <div className="p-6 space-y-3 overflow-y-auto pb-24">
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

                  </div>

                  <div className="sticky bottom-0 bg-white dark:bg-dark-bg border-t border-gray-500/[0.2] p-6 py-4 flex justify-end gap-3">
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

import * as Yup from 'yup';

export const createTaskSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    category: Yup.string().required('Category is required'),
    status: Yup.string().required('Status is required').oneOf(['upcoming', 'in progress', 'completed', 'suspended', 'pending']),
    dueDate: Yup.string().required('Due date is required'),
    priority: Yup.string().required('Priority is required').oneOf(['low', 'medium', 'high']),
    invites: Yup.string(),
    assignee: Yup.string() || Yup.array().of(Yup.string()),
    organizationId: Yup.string(),
    teamId: Yup.string(),
    comments: Yup.string(),
})

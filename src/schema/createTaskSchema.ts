import * as Yup from 'yup';

export const createTaskSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    category: Yup.string(),
    status: Yup.string().oneOf(['upcoming', 'in progress', 'completed', 'suspended', 'pending']),
    dueDate: Yup.string(),
    priority: Yup.string().oneOf(['low', 'medium', 'high']),
    recurring: Yup.boolean(),
    invites: Yup.string(),
    organizationId: Yup.string(),
    teamId: Yup.string(),
    comments: Yup.string(),
})

import * as Yup from 'yup';

export const createOrganizationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
})

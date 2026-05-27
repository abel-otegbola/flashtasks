'use client'
import { createContext, ReactNode, useContext, useState } from 'react';
import { ID, Query } from "appwrite";
import { databases, tablesDB } from "../appwrite/appwrite";
import { todo } from '../interface/todo';
import toast from "react-hot-toast";
import { indexTask } from '../services/indexer';
import { useOrganizations } from './organizationContext';
import { useUser } from './authContext';

type TasksContextValues = {
    tasks: todo[];
    loading: boolean;
    error: string | null;
    addTask: (task: Omit<todo, '$id' | 'id' | '$createdAt'>) => Promise<todo | null>;
    addMultipleTasks: (tasks: Omit<todo, '$id' | 'id' | '$createdAt'>[]) => Promise<todo[] | null>;
    updateTask: (taskId: string, updates: Partial<todo>) => Promise<todo | null>;
    deleteTask: (taskId: string) => Promise<void>;
    getTasks: (userEmail: string) => Promise<void>;
    getOrganizationTasks: (orgId: string) => Promise<void>;
    getTaskById: (taskId: string) => todo | undefined;
    filterTasksByStatus: (status: todo['status']) => todo[];
    filterTasksByCategory: (category: string) => todo[];
    movePendingToToday: () => Promise<number>;
    reorderTasks: (orderedTaskIds: string[]) => Promise<void>;
}

export const TasksContext = createContext({} as TasksContextValues);

export function useTasks() {
  return useContext(TasksContext);
}

// Appwrite configuration - Update these with your actual values
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'YOUR_DATABASE_ID';
const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || 'YOUR_TASKS_COLLECTION_ID';

const getTaskOrderIndex = (task: todo) => typeof task.orderIndex === 'number' ? task.orderIndex : Number.MAX_SAFE_INTEGER;

const sortTasksByOrder = (tasksToSort: todo[]) => [...tasksToSort].sort((left, right) => {
    const orderDiff = getTaskOrderIndex(left) - getTaskOrderIndex(right);
    if (orderDiff !== 0) return orderDiff;

    const createdDiff = new Date(left.$createdAt).getTime() - new Date(right.$createdAt).getTime();
    if (createdDiff !== 0) return createdDiff;

    return left.$id.localeCompare(right.$id);
});

const getTodayLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TasksProvider = ({ children }: { children: ReactNode}) => {
    const [tasks, setTasks] = useState<todo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const orgCtx = useOrganizations();
    const { user } = useUser();

    const getNextOrderIndex = (tasksToInspect: todo[]) => {
        const maxOrderIndex = tasksToInspect.reduce((max, task) => {
            const current = typeof task.orderIndex === 'number' ? task.orderIndex : -1;
            return Math.max(max, current);
        }, -1);

        return maxOrderIndex + 1;
    };

    const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() || '';

    const isOwnedByCurrentUser = (task: Pick<todo, 'userEmail' | 'userId'>) => {
        const currentEmail = normalizeEmail(user?.email);
        const taskEmail = normalizeEmail(task.userEmail);

        return Boolean(
            currentEmail && (
                taskEmail === currentEmail ||
                task.userId === user?.$id ||
                task.userId === (user as any)?.userId ||
                task.userId === (user as any)?._id?.toString?.()
            )
        );
    };

    const getTaskOrganizationId = (task?: Pick<todo, 'organizationId'> | null) => task?.organizationId || '';

    const canAccessOrganizationTask = (task: Pick<todo, 'organizationId' | 'userEmail' | 'userId' | 'assignees'>, mode: 'create' | 'update' | 'delete') => {
        const orgId = getTaskOrganizationId(task);
        if (!orgId) {
            return isOwnedByCurrentUser(task);
        }

        const hasFullAccess = orgCtx.hasPermission?.('Create/edit/delete all tasks', orgId) || false;
        if (hasFullAccess) return true;

        if (mode === 'create') {
            return orgCtx.hasPermission?.('Create tasks', orgId) || false;
        }

        const isOwnerTask = isOwnedByCurrentUser(task);
        const isAssignee = Boolean(user?.email && (task.assignees || []).includes(user.email));

        if (isOwnerTask && orgCtx.hasPermission?.('Edit their own tasks', orgId)) return true;
        if (isAssignee && orgCtx.hasPermission?.('Edit tasks assigned to them', orgId)) return true;

        return false;
    };

    const denyTaskAccess = (action: string) => {
        const message = `You do not have permission to ${action} this task`;
        setError(message);
        toast.error(message);
        return message;
    };

    const rollOverRecurringTasks = async (tasksToProcess: todo[]) => {
        const today = getTodayLocalDate();
        const recurringTasksToUpdate = tasksToProcess.filter((task) => {
            if (!task.recurring) return false;
            const taskDate = task.dueDate?.slice(0, 10);
            return taskDate !== today;
        });

        if (recurringTasksToUpdate.length === 0) {
            return tasksToProcess;
        }

        const updatedById = new Map<string, todo>();

        await Promise.all(recurringTasksToUpdate.map(async (task) => {
            try {
                const response = await databases.updateDocument(
                    DATABASE_ID,
                    TASKS_COLLECTION_ID,
                    task.$id,
                    { dueDate: today }
                );

                const updatedTask = response as unknown as todo;
                updatedById.set(updatedTask.$id, updatedTask);

                try {
                    await indexTask('update', updatedTask);
                } catch {}
            } catch (rolloverError) {
                console.error('Failed recurring rollover for task', task.$id, rolloverError);
            }
        }));

        return tasksToProcess.map((task) => updatedById.get(task.$id) || task);
    };

    // Get all tasks for the current user
    const getTasks = async (userEmail: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                [
                    Query.equal('userEmail', userEmail),
                    Query.limit(100)
                ]
            );
            const fetchedTasks = response.documents as unknown as todo[];
            const tasksAfterRollover = await rollOverRecurringTasks(fetchedTasks);

            setTasks(sortTasksByOrder(tasksAfterRollover));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const getOrganizationTasks = async (orgId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                [
                    Query.equal('organizationId', orgId),
                    Query.limit(100)
                ]
            );
            const fetchedTasks = response.documents as unknown as todo[];
            const tasksAfterRollover = await rollOverRecurringTasks(fetchedTasks);

            setTasks(sortTasksByOrder(tasksAfterRollover));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    // Add a single task
    const addTask = async (task: Omit<todo, '$id' | 'id' | '$createdAt'>): Promise<todo | null> => {
        setError(null);
        setLoading(true);
        
        try {
            const taskData: any = {
                title: task.title,
                description: task.description,
                category: task.category,
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                recurring: task.recurring || false,
                comments: task.comments || '[]',
                subtasks: task.subtasks || '[]',
                userId: task.userId,
                userEmail: task.userEmail,
                orderIndex: typeof task.orderIndex === 'number' ? task.orderIndex : getNextOrderIndex(tasks),
            };

            // Only add optional fields if they exist
            if (task.dueDate) taskData.dueDate = task.dueDate;
            if (task.assignees) taskData.assignees = task.assignees;
            if (task.invites) taskData.invites = task.invites;
            if ((task as any).organizationId) taskData.organizationId = (task as any).organizationId;
            if ((task as any).teamId) taskData.teamId = (task as any).teamId;

            const response = await databases.createDocument(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                ID.unique(),
                taskData
            );
            
            const newTask = response as unknown as todo;
            setTasks(prev => sortTasksByOrder([newTask, ...prev]));

            // Index the task in Elasticsearch via backend endpoint
            await indexTask('create', newTask);
            return newTask;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Add multiple tasks at once
    const addMultipleTasks = async (tasksToAdd: Omit<todo, '$id' | 'id' | '$createdAt'>[]): Promise<todo[] | null> => {
        setError(null);
        setLoading(true);
        
        try {
            const createdTasks: todo[] = [];
            
            // Create tasks sequentially to avoid rate limiting
            for (const task of tasksToAdd) {
                const taskData: any = {
                    title: task.title,
                    description: task.description,
                    category: task.category,
                    status: task.status || 'pending',
                    priority: task.priority || 'medium',
                    recurring: task.recurring || false,
                    comments: task.comments || '[]',
                    subtasks: task.subtasks || '[]',
                    userId: task.userId,
                    userEmail: task.userEmail,
                    orderIndex: typeof task.orderIndex === 'number' ? task.orderIndex : getNextOrderIndex(tasks),
                };

                // Only add optional fields if they exist
                if (task.dueDate) taskData.dueDate = task.dueDate;
                if (task.assignees) taskData.assignee = task.assignees;
                if (task.invites) taskData.invites = task.invites;
                if ((task as any).organizationId) taskData.organizationId = (task as any).organizationId;
                if ((task as any).teamId) taskData.teamId = (task as any).teamId;

                const response = await databases.createDocument(
                    DATABASE_ID,
                    TASKS_COLLECTION_ID,
                    ID.unique(),
                    taskData
                );
                
                createdTasks.push(response as unknown as todo);
                await indexTask('create', response);
            }
            
            setTasks(prev => sortTasksByOrder([...createdTasks, ...prev]));
            toast.success(`${createdTasks.length} tasks created successfully!`);
            return createdTasks;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create tasks';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update a task
    const updateTask = async (taskId: string, updates: Partial<todo>): Promise<todo | null> => {
        setError(null);

        const existingTask = tasks.find((task) => task.$id === taskId);
        if (!existingTask) {
            const message = 'Task not found';
            setError(message);
            toast.error(message);
            return null;
        }
        
        try {
            // Remove $createdAt and $updatedAt from updates as they're auto-managed by Appwrite
            const { $createdAt, $updatedAt, ...updateData } = updates as any;

            const response = await databases.updateDocument(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                taskId,
                updateData
            );
            
            const updatedTask = response as unknown as todo;
            setTasks(prev => sortTasksByOrder(prev.map(task => task.$id === taskId ? updatedTask : task)));

            // update index
            await indexTask('update', updatedTask);
            return updatedTask;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
        }
    };

    // Delete a task
    const deleteTask = async (taskId: string): Promise<void> => {
        setError(null);

        const existingTask = tasks.find((task) => task.$id === taskId);
        if (!existingTask) {
            const message = 'Task not found';
            setError(message);
            toast.error(message);
            return;
        }

        // if (!canAccessOrganizationTask(existingTask, 'delete')) {
        //     denyTaskAccess('delete');
        //     return;
        // }
        
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                TASKS_COLLECTION_ID,
                taskId
            );

            setTasks(prev => prev.filter(task => task.$id !== taskId));

            // delete from index
            await indexTask('delete', taskId);
            return;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        } finally {
        }
    };

    // Move all pending tasks to today by updating their dueDate
    const movePendingToToday = async (): Promise<number> => {
        setError(null);
        try {
            const today = new Date().toISOString().split('T')[0];
            const pendingTasks = tasks.filter(t => t.status === 'pending');
            if (pendingTasks.length === 0) {
                toast('No pending tasks to move');
                return 0;
            }

            const updatedTasks: todo[] = [];

            // Update sequentially to avoid rate limits
            for (const t of pendingTasks) {
                const response = await databases.updateDocument(
                    DATABASE_ID,
                    TASKS_COLLECTION_ID,
                    t.$id,
                    { dueDate: today }
                );
                const updated = response as unknown as todo;
                updatedTasks.push(updated);
                try { await indexTask('update', updated); } catch {}
            }

            // Merge updated tasks into state
            setTasks(prev => {
                const byId = new Map(prev.map(p => [p.$id, p]));
                for (const u of updatedTasks) byId.set(u.$id, u);
                return sortTasksByOrder(Array.from(byId.values()));
            });

            toast.success(`${updatedTasks.length} pending tasks moved to today`);
            return updatedTasks.length;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to move pending tasks';
            setError(errorMessage);
            toast.error(errorMessage);
            return 0;
        } finally {
        }
    };

    // Get a task by ID
    const getTaskById = (taskId: string): todo | undefined => {
        return tasks.find(task => task.$id === taskId);
    };

    // Filter tasks by status
    const filterTasksByStatus = (status: todo['status']): todo[] => {
        return tasks.filter(task => task.status === status);
    };

    // Filter tasks by category
    const filterTasksByCategory = (category: string): todo[] => {
        return tasks.filter(task => task.category === category);
    };

    const reorderTasks = async (orderedTaskIds: string[]) => {
        setError(null);

        const unauthorizedTask = orderedTaskIds
            .map((taskId) => tasks.find((task) => task.$id === taskId))
            .find((task) => {
                if (!task) return false;
                return !canAccessOrganizationTask(task, 'update');
            });

        if (unauthorizedTask) {
            denyTaskAccess('update');
            return;
        }

        try {
            for (const [index, taskId] of orderedTaskIds.entries()) {
                await databases.updateDocument(
                    DATABASE_ID,
                    TASKS_COLLECTION_ID,
                    taskId,
                    { orderIndex: index }
                );
            }

            setTasks(prev => sortTasksByOrder(prev.map(task => {
                const nextIndex = orderedTaskIds.indexOf(task.$id);
                return nextIndex >= 0 ? { ...task, orderIndex: nextIndex } : task;
            })));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reorder tasks';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const value: TasksContextValues = {
        tasks,
        loading,
        error,
        addTask,
        addMultipleTasks,
        updateTask,
        deleteTask,
        getTasks,
        getOrganizationTasks,
        getTaskById,
        filterTasksByStatus,
        filterTasksByCategory,
        movePendingToToday,
        reorderTasks,
    };

    return (
        <TasksContext.Provider value={value}>
            {children}
        </TasksContext.Provider>
    );
};

export default TasksProvider;

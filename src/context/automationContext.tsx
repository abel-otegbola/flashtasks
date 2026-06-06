import { createContext, ReactNode, useContext, useState } from "react";
import { Automation } from "../interface/automation";
import { databases } from "../appwrite/appwrite";
import { useUser } from "./authContext";
import { ID, Query } from "appwrite";

type values = {
    automations: Automation[];
    setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
    loading: boolean;
    getAutomations: () => Promise<Automation[]>;
    createAutomation: (automation: Omit<Automation, '$id' | '$createdAt' | '$updatedAt'>) => Promise<Automation>;
    updateAutomation: (automationId: string, updates: Partial<Automation>) => Promise<Automation>;
    deleteAutomation: (automationId: string) => Promise<void>;
}

export const AutomationContext = createContext({} as values);

export function useAutomations() {
  return useContext(AutomationContext);
}

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
const AUTOMATION_COLLECTION_ID = import.meta.env.VITE_APPWRITE_AUTOMATIONS_COLLECTION_ID || 'automations';

const AutomationProvider = ({ children }: { children: ReactNode}) => {
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(false);
      const { user } = useUser();

    const getAutomations = async () => {
        if (!user) throw new Error('User not authenticated');
        setLoading(true);
        try {
          const response = await databases.listDocuments(DATABASE_ID, AUTOMATION_COLLECTION_ID, [
            Query.equal('userId', [user?.$id]),
            Query.orderAsc('$createdAt'),
          ]);
          const next = response.documents as unknown as Automation[];
          setAutomations(next);
          return next;
        } catch (err) {
          console.error('Error loading automations', err);
          return [];
        }
        finally {
          setLoading(false);
        }
    };

    const createAutomation = async (automation: Omit<Automation, '$id' | '$createdAt' | '$updatedAt'>) => {
        if (!user) throw new Error('User not authenticated');
        setLoading(true);
        try {
          const response = await databases.createDocument(
            DATABASE_ID,
            AUTOMATION_COLLECTION_ID,
            ID.unique(),
            { ...automation, userId: user.$id }
          );
          const created = response as unknown as Automation;
          setAutomations(prev => [...prev, created]);
          return created;
        } catch (err) {
          console.error('Error creating automation', err);
          throw err;
        }
        finally {
            setLoading(false);
        }
    };

    const updateAutomation = async (automationId: string, updates: Partial<Automation>) => {
        if (!user) throw new Error('User not authenticated');
            setLoading(true);
            try {
                const updated = await databases.updateDocument(
                    DATABASE_ID,
                    AUTOMATION_COLLECTION_ID,
                    automationId,
                    updates                
                );
                setAutomations(prev => prev.map(a => a.$id === automationId ? ({ ...a, ...updates, $updatedAt: new Date().toISOString() } as Automation) : a));
                return updated as unknown as Automation;
            } catch (err) {
                console.error('Error updating automation', err);
                throw err;
            }
            finally {
                setLoading(false);
            }
    };

    const deleteAutomation = async (automationId: string) => {
        if (!user) throw new Error('User not authenticated');
        setLoading(true);
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                AUTOMATION_COLLECTION_ID,
                automationId
            );
            setAutomations(prev => prev.filter(a => a.$id !== automationId));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AutomationContext.Provider value={{ automations, setAutomations, loading, getAutomations, createAutomation, updateAutomation, deleteAutomation }}>
            {children}
        </AutomationContext.Provider>
    );
}

export default AutomationProvider;
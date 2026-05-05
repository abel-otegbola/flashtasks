'use client'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import toast, { Toaster } from "react-hot-toast";
import { ID, Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { account, databases, tablesDB, teams } from "../appwrite/appwrite";
import { useLocalStorage } from '../customHooks/useLocaStorage';
import { User } from '../interface/auth';
import { ADMIN_PERMISSIONS, MEMBER_PERMISSIONS } from '../interface/organization';

type values = {
    user: User;
    popup: { type: string, msg: string };
    loading: boolean;
    setPopup: (aug0: values["popup"]) => void;
    signIn: (email: string, password: string, callbackURL: string) => void; 
    signUp: ( name: string, email: string, password: string, callbackURL: string) => void;
    logOut: () => void;
    acceptTeamInvite: (teamId: string, membershipId: string, userId: string, secret: string) => Promise<boolean>;
}

export const AuthContext = createContext({} as values);

export function useUser() {
  return useContext(AuthContext);
}

const AuthProvider = ({ children }: { children: ReactNode}) => {
    const [user, setUser] = useLocalStorage("user", null);
    const [popup, setPopup] = useState({ type: "", msg: "" });
    const [loading, setLoading] = useState(false);
    const router = useNavigate();

    const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
    const ORG_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ORG_COLLECTION_ID || 'organizations';
    const USERS_TABLE_ID = import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users';

    const ensureMainUserRow = async (accountUser: any) => {
        if (!accountUser?.$id || !accountUser?.email) return false;

        try {
            const response = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: USERS_TABLE_ID,
            });

            const existing = (response.rows || []).find((row: any) => row.userId === accountUser.$id || row.email?.toLowerCase() === accountUser.email.toLowerCase());
            const userData = {
                userId: accountUser.$id,
                email: accountUser.email,
                fullname: accountUser.name || accountUser.fullname || accountUser.email,
                createdAt: accountUser.$createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (existing?.$id) {
                await tablesDB.updateRow({
                    databaseId: DATABASE_ID,
                    tableId: USERS_TABLE_ID,
                    rowId: existing.$id,
                    data: userData,
                });
            } else {
                await tablesDB.createRow({
                    databaseId: DATABASE_ID,
                    tableId: USERS_TABLE_ID,
                    rowId: accountUser.$id,
                    data: userData,
                });
            }

            return true;
        } catch (error) {
            console.error('Error syncing main user row', error);
            return false;
        }
    };

    const acceptTeamInvite = async (teamId: string, membershipId: string, userId: string, secret: string) => {
        setLoading(true);
        try {
            const membership = await teams.updateMembershipStatus({ teamId, membershipId, userId, secret });
            const loggedIn = await account.get();

            await ensureMainUserRow(loggedIn);

            const res = await databases.listDocuments(
                DATABASE_ID,
                ORG_COLLECTION_ID,
                [
                    Query.select(["*", "teams.*", "members.*"]),
                    Query.limit(100),
                ]
                );
            const nextRole = membership.roles[0] || 'member';
            const nextPermissions = membership.roles?.[0] === "admin" ? ADMIN_PERMISSIONS : MEMBER_PERMISSIONS;

            const existingMembers = Array.isArray(res.documents)
                ? res.documents.find(org => org.$id === teamId)?.members || []
                : [];

            const nextMember = {
                $id: loggedIn.$id,
                name: loggedIn.name || loggedIn.email,
                email: loggedIn.email,
                role: nextRole,
                permissions: nextPermissions,
            };
            const nextMembers = [
                ...existingMembers,
                nextMember,
            ];

            await databases.updateDocument(DATABASE_ID, ORG_COLLECTION_ID, teamId, { members: nextMembers });
            window.dispatchEvent(new Event('organizations:changed'));
            toast.success(`Joined ${res.documents[0]?.name || 'organization'}`);
            return true;
        } catch (error) {
            console.error('Error accepting team invite', error);
            toast.error('Failed to accept invite');
            return false;
        } finally {
            setLoading(false);
        }
    };

    async function signIn(email: string, password: string, callbackURL: string) {
        setLoading(true);
        try {
            // Create session
            await account.createEmailPasswordSession(email, password);

            // Fetch full account details (name, email, prefs, etc.)
            const loggedIn = await account.get();

            setPopup({ type: "success", msg: "Login successful" });
            setUser(loggedIn);
            await ensureMainUserRow(loggedIn);
            router(callbackURL || "/account/dashboard");
        } catch (error: any) {
            setPopup({ type: "error", msg: error?.message || 'Login failed' });
        } finally {
            setLoading(false);
        }
    }

    async function signUp(name: string, email: string, password: string, callbackURL: string) {
        setLoading(true)
        
        const promise = tablesDB.listRows({
            databaseId: "68ed2831002414dd5275",
            tableId: "waitlist",
        });

        promise.then(async function (response) { // 1️⃣ Check if username already exists
            if(response.rows.map(r => r.name.toLowerCase()).includes(name.toLowerCase())) {
                setPopup({ type: "error", msg: "Username already exists" })
                setLoading(false)
            }
            else {                
                await account.create(ID.unique(), email, password, name)
                .then(() => {
                    setPopup({ type: "success", msg: "Registered successful" })
                    tablesDB.createRow({
                        databaseId: '68ed2831002414dd5275',
                        tableId: 'waitlist',
                        rowId: ID.unique(),
                        data: { email, name }
                    });
                    signIn(email, password, callbackURL || "/account/dashboard")
                })
                .catch(error => {
                    setLoading(true)
                    setPopup({ type: "error", msg: error.message })
                })
                .finally (() => {
                    setLoading(false)
                })
            }
        }, function (error) {
            console.log(error);
            setLoading(false)
        });
    }
    
    async function logOut() {
        await account.deleteSession("current");
        setUser(null);
    }

    async function init() {
        try {
            const loggedIn = await account.get();
            setUser(loggedIn);
            await ensureMainUserRow(loggedIn);
        } catch {
            setUser(null);
        }
    }

    useEffect(() => {
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if(popup.type === "success") {
            toast.success(popup.msg)
        }
        else if(popup.type === "error") {
            toast.error(popup.msg)
        }
    }, [popup])

    return (
        <AuthContext.Provider value={{ user, popup, loading, setPopup, signIn, signUp, logOut, acceptTeamInvite }}>
            <Toaster containerClassName="p-8" />
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
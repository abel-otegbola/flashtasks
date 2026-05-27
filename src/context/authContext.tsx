'use client'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import toast, { Toaster } from "react-hot-toast";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import { account, tablesDB, teams } from "../appwrite/appwrite";
import { useLocalStorage } from '../customHooks/useLocaStorage';
import { User } from '../interface/auth';

type values = {
    user: User;
    popup: { type: string, msg: string };
    loading: boolean;
    setPopup: (aug0: values["popup"]) => void;
    signIn: (email: string, password: string, callbackURL: string) => void; 
    signUp: ( name: string, email: string, password: string, callbackURL: string) => void;
    logOut: () => void;
    acceptTeamInvite: (teamId: string, membershipId: string, userId: string, secret: string) => Promise<boolean>;
    getPhotoUrl: (email: string) => Promise<string | null>;
    updateAvatar: (file: File) => Promise<string>;
    updateProfile: (values: { name: string; photoUrl?: string }) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    updateEmailVerification: (userId: string, secret: string) => Promise<void>;
    emailVerification: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    updatePassword: (password: string, userId: string, secret: string) => Promise<void>;
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

    const DATABASE_ID = import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || '';
    const USERS_TABLE_ID = import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users';

    const ensureMainUserRow = async (accountUser: any) => {
        if (!accountUser?.$id || !accountUser?.email) return false;

        try {
            const response = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: USERS_TABLE_ID,
            });

            const existing = (response.rows || []).find((row: any) => row.$id === accountUser.$id || row.email?.toLowerCase() === accountUser.email.toLowerCase());
            const userData = {
                $id: accountUser.$id,
                email: accountUser.email,
                name: accountUser.name || accountUser.name || accountUser.email,
                $createdAt: accountUser.$createdAt || new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
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
            const loggedIn = await account.get();
            if (!loggedIn) {
                toast.error('You must be logged in to accept the invite');
                router("/auth/login?callbackURL=/account/dashboard");
                return false;
            }

            await ensureMainUserRow(loggedIn);
            const membership = await teams.updateMembershipStatus({ teamId, membershipId, userId, secret });

            window.dispatchEvent(new Event('organizations:changed'));
            toast.success(`Joined ${membership?.teamName || 'organization'}`);
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
            databaseId: import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || 'YOUR_DATABASE_ID',
            tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
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
                        databaseId: DATABASE_ID,
                        tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
                        rowId: ID.unique(),
                        data: { email, name, photoUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}` },
                    });
                    emailVerification();
                    signIn(email, password, "/auth/signup/success")
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

    const emailVerification = async () => {
        try {
            await account.createVerification(`https://flashtasks.app/auth/verify-email`);
            setPopup({ type: "success", msg: "Email verification link has been sent to your email" })
            setLoading(false);
        } catch (error) {
            console.error('Failed to create email verification', error);
            setLoading(false);
        }
    };

    const updateEmailVerification = async (userId: string, secret: string) => {
        try {
            await account.updateVerification({ userId, secret })
            .then(async () => {
                setPopup({ type: "success", msg: "Email verified successfully" })
                setUser({...user, emailVerification: true });
                setLoading(false);
                router("/account/dashboard");
            });
        } catch (error) {
            console.error('Failed to update email verification', error);
            setLoading(false);
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            await account.createRecovery(email, `https://flashtasks.app/auth/reset-password`)
            .then(() => {
                setPopup({ type: "success", msg: "Password recovery link has been sent to your email" })
                setLoading(false);
            });
        } catch (error) {
            console.error('Failed to create password recovery', error);
            setPopup({ type: "error", msg: (error as any)?.message || 'Failed to send password recovery email' });
            setLoading(false);
        }
    };

    const updatePassword = async (password: string, userId: string, secret: string) => {
        try {
            await account.updateRecovery({password, userId, secret}).then(() => {
                setPopup({ type: "success", msg: "Password updated successfully" })
                router("/auth/login");
            });
        } catch (error) {
            console.error('Failed to update password', error);
            setPopup({ type: "error", msg: (error as any)?.message || 'Failed to update password' });
        }
    };

    const getPhotoUrl = async (email: string) => {
        try {
            const response = await tablesDB.listRows({
                databaseId: import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || 'YOUR_DATABASE_ID',
                tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
            });

            const row = response.rows.find((doc: any) => (doc.email?.toLowerCase?.() === email.toLowerCase() || doc.name?.toLowerCase?.() === email.toLowerCase()));
            return row?.photoUrl || null;
        } catch (error) {
            console.error('Failed to load photo url', error);
            return null;
        }
    }

    const readFileAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Unable to read the selected file'));
            reader.readAsDataURL(file);
        });

    const updateAvatar = async (file: File) => {
        const fileData = await readFileAsDataUrl(file);
        const response = await fetch('/api/cloudinary/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file: fileData,
                fileName: file.name,
                folder: import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER || 'profile-photos',
            }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload?.error || 'Failed to upload image');
        }

        return String(payload?.secure_url || '');
    };

    const updateProfile = async ({ name, photoUrl }: { name: string; photoUrl?: string }) => {
        setLoading(true);
        try {
            const currentUser = await account.get();

            if (name && name !== currentUser.name) {
                
                const promise = tablesDB.listRows({
                    databaseId: import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || 'YOUR_DATABASE_ID',
                    tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
                });
                promise.then(async function (res) { // 1️⃣ Check if username already exists
                    if(res.rows.map(r => r.name.toLowerCase()).includes(name.toLowerCase())) {
                        setPopup({ type: "error", msg: "Username already exists" })
                        setLoading(false)
                        return;
                    }
                    else await account.updateName(name);
                }, function (error) {
                    console.log(error);
                    setLoading(false)
                    return;
                });
            }

            const refreshed = await account.get();

            const response = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: USERS_TABLE_ID,
            });

            const existing = (response.rows || []).find((row: any) => row.$id === refreshed.$id || row.email?.toLowerCase() === refreshed.email.toLowerCase());
            const rowData = {
                $id: refreshed.$id,
                email: refreshed.email,
                name: refreshed.name || refreshed.email,
                photoUrl: photoUrl || existing?.photoUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${refreshed.name || refreshed.email}`,
                $createdAt: existing?.$createdAt || refreshed.$createdAt || new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
            };

            if (existing?.$id) {
                await tablesDB.updateRow({
                    databaseId: DATABASE_ID,
                    tableId: USERS_TABLE_ID,
                    rowId: existing.$id,
                    data: rowData,
                });
                
                setPopup({ type: 'success', msg: 'Profile updated' });
            } else {
                await tablesDB.createRow({
                    databaseId: DATABASE_ID,
                    tableId: USERS_TABLE_ID,
                    rowId: refreshed.$id,
                    data: rowData,
                });
                    setPopup({ type: 'success', msg: 'Profile updated' });
            }

            setUser(refreshed);
            try { localStorage.setItem('user', JSON.stringify(refreshed)); } catch {}
        } catch (error: any) {
            console.error('Failed to update profile', error);
            setPopup({ type: 'error', msg: error?.message || 'Failed to update profile' });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        setLoading(true);
        try {
            await account.updatePassword(newPassword, currentPassword);
            setPopup({ type: 'success', msg: 'Password updated' });
        } catch (error: any) {
            console.error('Failed to update password', error);
            setPopup({ type: 'error', msg: error?.message || 'Failed to update password' });
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    
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
        <AuthContext.Provider value={{ user, popup, loading, setPopup, signIn, signUp, logOut, acceptTeamInvite, getPhotoUrl, updateAvatar, updateProfile, changePassword, updateEmailVerification, emailVerification, forgotPassword, updatePassword }}>
            <Toaster containerClassName="p-8" />
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
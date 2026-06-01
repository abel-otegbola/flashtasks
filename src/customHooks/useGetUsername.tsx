import { useEffect, useState } from 'react';
import { tablesDB } from '../appwrite/appwrite';
import { useUser } from '../context/authContext';

type GetUsernameProps = {
  email?: string;
  userId?: string;
  className?: string;
};

export default function GetUsername({ email, userId, className }: GetUsernameProps) {
  const [username, setUsername] = useState<string>('Unknown user');
  const { user } = useUser();

  useEffect(() => {
    let cancelled = false;

    const loadUsername = async () => {
      const resolvedEmail = String(email || '');
      const resolvedUserId = String(userId || '');

      if (user?.$id && resolvedUserId && user.$id === resolvedUserId) {
        if (!cancelled) setUsername(user.name || user.email || 'Unknown user');
        return;
      }

      if (user?.email && resolvedEmail && user.email.toLowerCase() === resolvedEmail.toLowerCase()) {
        if (!cancelled) setUsername(user.name || user.email || 'Unknown user');
        return;
      }

      try {
        const response = await tablesDB.listRows({
          databaseId: import.meta.env.VITE_APPWRITE_USERS_DATABASE_ID || 'YOUR_DATABASE_ID',
          tableId: import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',
        });

        const row = response.rows.find((item: any) => (
          item.$id === resolvedUserId
          || item.email?.toLowerCase?.() === resolvedEmail.toLowerCase()
          || item.name?.toLowerCase?.() === resolvedEmail.toLowerCase()
        ));

        const nextUsername = String(row?.name || row?.email || resolvedEmail.split('@')[0] || resolvedUserId || 'Unknown user');

        if (!cancelled) {
          setUsername(nextUsername);
        }
      } catch {
        const fallback = resolvedEmail.split('@')[0] || resolvedUserId || 'Unknown user';
        if (!cancelled) setUsername(fallback);
      }
    };

    loadUsername();

    return () => {
      cancelled = true;
    };
  }, [email, user?.email, user?.$id, user?.name, userId]);

  return <span className={className}>{username}</span>;
}
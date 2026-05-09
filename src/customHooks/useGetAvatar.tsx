import { useEffect, useState } from "react";
import { useUser } from "../context/authContext";

export default function GetAvatar({ email, className }: { email: string; className?: string }) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const { getPhotoUrl } = useUser();
    
    useEffect(() => {
        const loadPhoto = async () => {
            const nextPhotoUrl = await getPhotoUrl(email || "");
            if (nextPhotoUrl) {
                setPhotoUrl(nextPhotoUrl);
            }
            else {
                setPhotoUrl(`https://www.gravatar.com/avatar/${email.trim().toLowerCase()}?s=200&d=identicon`);
            }
        };

        loadPhoto();
    }, [getPhotoUrl, email]);

    return (
        <span className={`border-2 border-white flex items-center w-8 h-8 overflow-hidden rounded-full bg-gray-100 dark:bg-[#202020] dark:border-[#151515] flex items-center justify-center text-[10px] ${className}`}>
            <img
                src={photoUrl || `https://www.gravatar.com/avatar/${email.trim().toLowerCase()}?s=200&d=identicon`}
                alt={email}
            />
        </span>
    );
}
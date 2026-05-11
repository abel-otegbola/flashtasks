import { PlusIcon } from "@phosphor-icons/react"
import { ReactElement } from "react"
import { useUser } from "../../context/authContext";
import { Link, useLocation } from "react-router-dom";
import { Home, Server, Settings, UsersGroupTwoRounded } from "@solar-icons/react";

type navTab =  {
    id: number | string,
    label: string,
    to: string,
    icon: ReactElement
}

export default function MobileNav() {
    const { user } = useUser();
    const pathname = useLocation().pathname;
    
    const navTabs: navTab[] = [
        { id: 1, label: "Home", to: "/account/dashboard", icon: <Home /> },
        { id: 2, label: "tasks", to: "/account/tasks", icon: <Server /> },
        { id: 2, label: "New", to: "/account/tasks/new", icon: <PlusIcon /> },
        { id: 4, label: "Organizations", to: "/account/organizations", icon: <UsersGroupTwoRounded /> },
        { id: 5, label: "Settings", to: !user ? "/login" : "/account/settings", icon: <Settings /> },
    ]

    return (
         <nav className="grid grid-cols-5 py-4 bg-white dark:bg-dark-bg fixed bottom-0 left-0 w-full border-t border-gray-500/[0.1] items-center gap-0 z-[40]">
            {
                navTabs.map((tab: navTab) => (
                    <Link key={tab.id}
                        to={tab.to}
                        className={`relative flex items-center justify-center md:flex-row flex-col gap-1 h-[40px] p-[8px_16px] hover:text-primary font-medium rounded-lg duration-500
                            ${pathname.includes(tab.to) ? "text-primary" : "hover:bg-primary/[0.02]"}
                        `}
                    >
                        { tab.label === "New" ?
                        <span className={`md:text-md md:text-[20px] p-4 shadow-lg translate-y-[-20px] rounded-full bg-primary text-white ${pathname.includes(tab.to) ? "text-[24px]": "text-[20px]"}`}>{tab.icon}</span>
                        :
                        <>
                        <span className={`text-[20px]`}>{tab.icon}</span>
                        <span className="md:inline md:text-[12px] text-[9px] opacity-50"> {tab.label}</span>
                        </>
                        }
                    </Link>
                ))
            }
        </nav>
        
    )
}
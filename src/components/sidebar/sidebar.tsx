'use client'
import { useState, type ReactElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoIcon from "../../assets/icons/logo";
import { useOutsideClick } from "../../customHooks/useOutsideClick";
import { Bell, Calendar, DollarMinimalistic, Home, IconProps, Logout, Server, Settings, UsersGroupTwoRounded } from "@solar-icons/react";
import ThemeSelector from "../themeSelector/themeSelector";
import { useUser } from "../../context/authContext";

export interface Link {
    id: number; label: string; icon: ReactElement<IconProps>, link: string, subtext?: string
}

function Sidebar() {
    const [open, setOpen] = useState(false)
    const pathname = useLocation().pathname;
    const { user, logOut } = useUser();
    const navigate = useNavigate();

    // Get user's initials for avatar
    const getUserInitial = () => {
        if (user?.name && typeof user.name === 'string') {
            return user.name.charAt(0).toUpperCase();
        } else if (user?.email && typeof user.email === 'string') {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const generalLinks: Link[] = [
        { id: 0, label: "Dashboard", icon: <Home size={16} />, link: "/account/dashboard" },
        { id: 1, label: "Tasks", icon: <Server size={16} />, link: "/account/tasks" },
        { id: 2, label: "Organizations", icon: <UsersGroupTwoRounded size={16} />, link: "/account/organizations" },
    ]
    
    const otherLinks: Link[] = [
        { id: 0, label: "Pricing", icon: <DollarMinimalistic size={16} />, link: "/account/pricing" },
        { id: 1, label: "Notifications", icon: <Bell size={16} />, link: "/account/notifications" },
        { id: 2, label: "Settings", icon: <Settings size={16} />, link: "/account/settings" },
        // Logout is handled specially to run the logout effect
        { id: 3, label: "Logout", icon: <Logout size={16} />, link: "#" },
    ]
    const modalRef = useOutsideClick(setOpen, false)

    return (
        <div ref={modalRef} className={`md:sticky top-0 left-0 h-screen w-0 md:p-4 duration-500 ${open ? "sm:w-[100px]": "sm:w-[250px]"}`}>
            <button className={`md:absolute fixed sm:top-10 top-6 md:right-[2px] right-5 flex flex-col justify-center items-center bg-white/[0.7] dark:bg-dark-bg/[0.7] backdrop-blur-md gap-1 w-5 h-8 z-[50] p-[2px] px-[13px] border border-gray-500/[0.2] rounded-full`} onClick={() => setOpen(!open)}>
                <span className={`w-[7px] h-[1px] py-[0.5px] px-[6px] duration-500 transition-all bg-dark-bg dark:bg-white/[0.5] rounded-[2px] ${open ? "rotate-[45deg] translate-y-[4px]" : "rotate-[0deg]"}`}></span>
                <span className={`duration-500 transition-all bg-dark-bg dark:bg-white/[0.5] rounded-[2px] ${open ? "py-[0px] w-[0px] h-[0px] translate-x-[-12px]" : "translate-x-[4px] py-[0.5px] px-[4px] w-[8px] h-[0.5px]"}`}></span>
                <span className={`w-[7px] h-[1px] py-[0.5px] px-[6px] duration-500 transition-all bg-dark-bg dark:bg-white/[0.5] rounded-[2px] ${open ? "rotate-[-45deg] translate-y-[-4px]" : "rotate-[0deg]"}`}></span>
            </button>
            <div className={`flex flex-col justify-between md:h-full bg-white dark:bg-dark-bg-secondary border border-gray-500/[0.1] dark:border-gray-500/[0.2] h-[100vh] md:rounded-[20px] md:sticky fixed md:top-0 top-0 py-4 px-4 right-0 overflow-y-auto overflow-x-hidden z-[5] transition-all duration-700 ${open ? "sm:w-[70px] w-[280px] translate-x-[0px] opacity-[1]": "sm:w-full translate-x-[400px] md:translate-x-[0px] md:opacity-[1] opacity-[0]"}`}>  
                <Link to={"/"} className="flex items-center mb-2 sm:p-1">
                    <LogoIcon className="text-primary 2xl:w-[40px] md:w-[32px] w-[24px]" />
                </Link>

                {/* Navigation Links */}
                <div className="flex-1 flex flex-col gap-6 text-sm">
                    <div className="flex flex-col gap-2">
                        <p className={`text-gray-400 mb-2 ${open ? "sm:opacity-0" : ""}`}>GENERAL</p>
                        {
                        generalLinks.map(link => {
                                return (
                                <Link key={link.id} onClick={() => setOpen(false)} to={ link.link} className={`relative flex items-center justify-between px-3 py-1 h-[32px] md:rounded-[6px] duration-300 font-medium ${pathname.includes(link.link) ? "bg-bg-gray-100 dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2]" : " hover:bg-gray-100 dark:hover:bg-dark-bg"}`}>
                                    <div className="flex items-center gap-1">
                                        <span className="w-[24px] opacity-[0.6]">{link.icon}</span>
                                        <span className={`flex-1 py-1 break-normal duration-500 ${open ? "sm:hidden" : ""}`}>{link.label} </span>
                                    </div>
                                    { link.subtext ? <span className="flex items-center justify-center bg-primary text-white text-[9px] rounded-full px-[6px]">{link.subtext}</span> : ""}
                                </Link>
                                )
                        })
                        }
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <p className={`text-gray-400 mb-2 ${open ? "sm:opacity-0" : ""}`}>OTHERS</p>
                        {
                        otherLinks.map(link => {
                                // For Logout, render a button that triggers the auth logout flow
                                if (link.label === 'Logout') {
                                    return (
                                        <button
                                            key={link.id}
                                            onClick={async () => { setOpen(false); await logOut(); navigate('/auth/waitlist'); }}
                                            className={`relative w-full text-left flex items-center justify-between px-3 py-1 h-[32px] md:rounded-[6px] duration-300 font-medium cursor-pointer ${pathname.includes(link.link) ? "bg-bg-gray-100 dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2]" : " hover:bg-gray-100 dark:hover:bg-dark-bg"}`}>
                                            <div className="flex items-center gap-1">
                                                <span className="w-[24px] opacity-[0.6]">{link.icon}</span>
                                                <span className={`flex-1 py-1 break-normal duration-500 ${open ? "sm:hidden" : ""}`}>{link.label} </span>
                                            </div>
                                        </button>
                                    )
                                }

                                return (
                                <Link key={link.id} onClick={() => setOpen(false)} to={ link.link} className={`relative flex items-center justify-between px-3 py-1 h-[32px] md:rounded-[6px] duration-300 font-medium ${pathname.includes(link.link) ? "bg-bg-gray-100 dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2]" : " hover:bg-gray-100 dark:hover:bg-dark-bg"}`}>
                                    <div className="flex items-center gap-1">
                                        <span className="w-[24px] opacity-[0.6]">{link.icon}</span>
                                        <span className={`flex-1 py-1 break-normal duration-500 ${open ? "sm:hidden" : ""}`}>{link.label} </span>
                                    </div>
                                    { link.subtext ? <span className="flex items-center justify-center bg-primary text-white text-[9px] rounded-full px-[6px]">{link.subtext}</span> : ""}
                                </Link>
                                )
                        })
                        }
                    </div>
                </div>

                {/* User Info & Theme Toggle */}
                <div className="flex flex-col gap-3 pt-4 border-t border-border-gray-100 dark:border-gray-700 mt-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between px-3 py-2">
                        <span className={`text-sm text-gray-600 dark:text-gray-400 ${open ? "sm:hidden" : ""}`}>Theme</span>
                        <ThemeSelector />
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className={`flex items-center gap-3 p-1`}>
                            {/* User Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {getUserInitial()}
                            </div>
                            
                            {/* User Details */}
                            <div className={`flex-1 min-w-0 ${open ? "sm:hidden" : ""}`}>
                                <p className="font-medium text-sm truncate dark:text-white">
                                    {user.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email || ''}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Sidebar

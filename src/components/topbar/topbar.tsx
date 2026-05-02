import { Link, useLocation } from "react-router-dom";
import LogoIcon from "../../assets/icons/logo";
import Button from "../button/button";
import { useState, useEffect } from "react";
import ThemeSelector from "../themeSelector/themeSelector";
import SearchBar from "../search/searchBar";
import { useUser } from "../../context/authContext";

function Topbar() {
    const pathname = useLocation().pathname;
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState("")
    const { user } = useUser();

    const AuthCTA = () => {
        if (user && (user as any).name) {
        const initial = ((user as any).name || (user as any).email || 'U')[0].toUpperCase();
        return (
            <Link to={"/account/dashboard"} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">{initial}</Link>
        );
        }

        return (
            <div className="flex md:flex-row flex-col gap-4">
                <Button href="/auth/login" variant="tertiary" className="md:w-fit w-full">Login</Button>
                <Button href="/auth/signup" variant="secondary" className="md:w-fit w-full">Sign up</Button>
            </div>
        );
    }

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)

            // Detect active section
            const sections = ["features", "how-it-works", "pricing", "testimonials"]
            const scrollPosition = window.scrollY + 100 // Offset for better detection

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId)
                if (element) {
                    const { offsetTop, offsetHeight } = element
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(`#${sectionId}`)
                        break
                    }
                }
            }

            // Clear active section if at the top
            if (window.scrollY < 100) {
                setActiveSection("")
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
        <div className={`flex justify-between items-center w-full md:px-[8%] px-4 py-2 z-[3] sticky top-0 bg-white dark:bg-[#101010] backdrop-blur-sm transition-shadow duration-300 ${scrolled ? 'border-b border-gray-500/[0.1]' : ''}`}>
            <Link to={"/"} className="md:w-[19%] text-start flex gap-2 items-center">
                <LogoIcon className="w-[14px]"  />
                <h3 className="text-[16px] font-bold">Flash Tasks</h3>
            </Link>
            
            <ul className={`
                md:static fixed top-0 right-0 z-20 flex md:flex-row flex-col md:px-0 md:py-0 py-12 px-6 bg-white dark:bg-[#101010] md:w-auto md:h-full h-screen w-full
                ${open ? "translate-x-[0px]" : "md:translate-x-[0] translate-x-[120%]"} duration-500
            `}>
                {
                    [
                        { id: 0, title: "Features", href: "#features" },
                        { id: 1, title: "Solutions", href: "#solutions" },
                        { id: 2, title: "Resources", href: "#resources" },
                        { id: 3, title: "Pricing", href: "#pricing" },
                    ].map(link => (
                            <Link
                                to={link.href} 
                                className={`font-semibold md:py-4 mx-6 py-6 md:border-none border-b border-gray-500/[0.2] duration-300 ${activeSection === link.href ? 'text-primary' : 'text-[#939395]'} hover:text-primary dark:hover:text-primary`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.querySelector(link.href);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                        setOpen(false);
                                    }
                                }}
                            >
                                <span>{link.title}</span> 
                            </Link>
                    ))
                }
                <div className="flex md:hidden flex-col gap-4 p-6">
                    <AuthCTA />
                </div>
            </ul>

            {/* Right actions + search */}
            <div className="flex items-center justify-end gap-6 md:w-[19%] w-auto">
                <div className="md:flex hidden gap-4">
                    <ThemeSelector />
                    <AuthCTA />
                </div>
                <button className="flex flex-col justify-center items-center gap-1 text-lg w-10 h-10 md:hidden z-[50]" onClick={() => setOpen(!open)}>
                    <span className={`w-[8px] h-[3px] py-[1px] px-[10px] duration-500 transition-all dark:bg-white bg-dark rounded-[2px] ${open ? "rotate-[45deg] translate-y-[5px]" : "rotate-[0deg]"}`}></span>
                    <span className={`duration-500 transition-all dark:bg-white bg-dark rounded-[2px] ${open ? "py-[0px] w-[0px] h-[0px] translate-x-[-12px]" : "translate-x-[4px] py-[1px] px-[4px] w-[8px] h-[3px]"}`}></span>
                    <span className={`w-[8px] h-[3px] py-[1px] px-[10px] duration-500 transition-all dark:bg-white bg-dark rounded-[2px] ${open ? "rotate-[-45deg] translate-y-[-5px]" : "rotate-[0deg]"}`}></span>
                </button>
            </div>
            
        </div>
        </>
    )
}

export default Topbar

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
        <Button href="/auth/signup">Sign up</Button>
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
        <div className={`flex justify-between items-center w-full md:px-9 p-4 z-[3] sticky top-0 bg-white dark:bg-dark backdrop-blur-sm transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
            <Link to={"/"} className="md:w-[13%] text-start flex gap-2 items-center">
                <LogoIcon className="" />
                <h3 className="text-[16px] font-medium text-primary">Flashtasks</h3>
            </Link>
            
            <div className="md:static fixed top-0 right-0 z-20 overflow-hidden md:h-auto h-screen">
                <ul className={`
                    flex md:flex-row flex-col md:px-0 md:py-0 py-12 px-6 bg-white dark:bg-dark md:w-auto h-full w-[100%] 
                    ${open ? "translate-x-[0px]" : "md:translate-x-[0] translate-x-[120%]"} duration-500
                `}>
                    {
                        [
                            { id: 0, title: "Features", href: "#features" },
                            { id: 1, title: "How It Works", href: "#how-it-works" },
                            { id: 2, title: "Pricing", href: "#pricing" },
                            { id: 3, title: "Testimonials", href: "#testimonials" },
                        ].map(link => (
                            <li key={link.id} className="px-2 py-3">
                                <a 
                                    href={link.href} 
                                    className={`font-medium p-4 duration-300 w-full ${activeSection === link.href ? 'text-primary' : 'text-text-black dark:text-gray-200'} hover:text-primary dark:hover:text-primary`}
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
                                </a>
                            </li>
                        ))
                    }
                    <div className="flex flex-col gap-4 md:hidden p-6 mt-16 dark:text-gray-200">
                        Have ideas to make flashtasks better?
                        <Link to="/contact" className="text-primary">Message us</Link>
                    </div>
                </ul>
            </div>

            {/* Right actions + search */}
            <div className="flex items-center justify-end gap-6 md:w-[13%]">
                <ThemeSelector />
                <AuthCTA />
                <button className="flex flex-col justify-center items-center gap-1 text-lg w-10 h-10 md:hidden z-[50]" onClick={() => setOpen(!open)}>
                    <span className={`w-[8px] h-[2px] py-[1px] px-[10px] duration-500 transition-all dark:bg-white bg-dark rounded-[2px] ${open ? "rotate-[45deg] translate-y-[4.5px]" : "rotate-[0deg]"}`}></span>
                    <span className={`duration-500 transition-all dark:bg-white bg-dark rounded-[2px] ${open ? "py-[0px] w-[0px] h-[0px] translate-x-[-12px]" : "translate-x-[4px] py-[1px] px-[4px] w-[8px] h-[2px]"}`}></span>
                    <span className={`w-[8px] h-[2px] py-[1px] px-[10px] duration-500 transition-all dark:bg-white bg-dark rounded-[2px] ${open ? "rotate-[-45deg] translate-y-[-4.5px]" : "rotate-[0deg]"}`}></span>
                </button>
            </div>
            
        </div>
        </>
    )
}

export default Topbar

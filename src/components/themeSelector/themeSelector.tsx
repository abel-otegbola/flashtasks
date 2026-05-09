'use client'
import { Moon, Sun } from "@solar-icons/react";
import { ReactElement, useEffect, useState } from "react";

interface Theme {
    id: string | number, img: ReactElement, title: string
}

type Themes = Array<Theme>


function ThemeSelector() {
    const [theme, setTheme] = useState(localStorage.theme || 'light')

    const themes: Themes = [
        { id: 1, img: <Sun size={10} />, title: "light" },
        { id: 2, img: <Moon size={10} />, title: "dark" },
    ]
    
    useEffect(() => {
        const root = document.documentElement;
        
        if(theme === 'light') {
            // Whenever the user explicitly chooses light mode
            localStorage.theme = 'light'
            root.style.colorScheme = 'light'
            root.setAttribute('data-theme', 'light')
        }
        else if(theme === 'dark') {
            // Whenever the user explicitly chooses dark mode
            localStorage.theme = 'dark'
            root.style.colorScheme = 'dark'
            root.setAttribute('data-theme', 'dark')
        }  
    }, [theme])
    
    useEffect(() => {
        // On page load, set the initial theme
        const savedTheme = localStorage.theme;
        if (savedTheme) {
            setTheme(savedTheme)
        } else {
            setTheme('light')
        }
    }, [])

    return (
        <button className="flex gap-2 border border-gray-500/[0.1] p-1 rounded-lg">                      
            {
            themes.map(item => {
                return (
                    <span 
                        key={item.id} 
                        className={`flex items-center leading-0 gap-1 text-[10px] p-2 pr-3 rounded ${item.title === theme ? "bg-primary text-white" : ""}`} 
                        aria-label={"Theme setting changed to "+ theme} 
                        onClick={() => setTheme(item.title)} 
                    >{item.img}{item.title}</span>
                )
            })}
        </button>
    )
}

export default ThemeSelector;
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

export interface buttonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "tertiary";
    className?: string;
    href?: string;
    size?: "small" | "medium" | "large" | "xs";
    disabled?: boolean,
    onClick?: () => void,
    children?: ReactNode
}

export default function Button({ variant, className, href, size, disabled, onClick, children, ...props }: buttonProps) {
    const variants = {
        primary: "hover:bg-black bg-dark text-white",
        secondary: "hover:bg-primary/[0.2] border border-gray-500/[0.2] text-black dark:border-gray-500/[0.3] dark:text-white/[0.7]",
        tertiary: "rounded-[4px]"
    }

    return (
       <>
            { 
            href ? 
                <Link role="button" to={href} className={`flex items-center justify-center md:gap-2 gap-1 w-fit 
                    ${variants[variant || "primary"]} 
                    ${disabled ? "opacity-[0.25]" : ""} 
                    ${size === "xs" ? "rounded-[2px] text-[8px] py-[2px] md:px-[8px] px-[4px]" : size === "small" ? "rounded text-[12px] py-[4px] md:px-[12px] px-[8px]" : size === "large" ? "rounded-[12px] md:py-[16px] py-[10px] md:px-[32px] px-[28px]" : "rounded-[6px] text-[14px] py-[10px] px-[24px]"} 
                    ${className} 
                     `}> 
                    { children }
                </Link>

                : <button className={` duration-500 flex items-center justify-center md:gap-2 gap-1 w-fit cursor-pointer
                    ${variants[variant || "primary"]} 
                    ${disabled ? "opacity-[0.25]" : ""} 
                    ${size === "xs" ? "rounded-[2px] text-[8px] py-[2px] md:px-[8px] px-[4px]" : size === "small" ? "rounded text-[12px] py-[4px] md:px-[12px] px-[8px]" : size === "large" ? "rounded-[12px] md:py-[16px] py-[10px] md:px-[32px] px-[28px]" : "rounded-[6px] text-[14px] py-[10px] px-[24px]"} 
                    ${className} 
                `}
                {...props}
                name="Button"
                role="button"
                disabled={disabled}
                onClick={onClick}
                >
                { children }
                </button>
        }
    </>
    )
}
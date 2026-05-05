'use client'
import { type ReactNode, useState } from "react";
import { useOutsideClick } from "../../customHooks/useOutsideClick";
import { AltArrowDown } from "@solar-icons/react";

type option = {
  id: string | number;
  icon?: ReactNode;
  title: string;
  onClick?: () => void;
}

interface dropdownProps {
    variant?: "primary" | "secondary";
    className?: string;
    disabled?: boolean;
    label?: string;
    name?: string;
    value: string | number;
    onChange: (value: string) => void;
    error?: string | undefined;
    leftIcon?: ReactNode;
    options?: option[];
    placeholder?: string | ReactNode;
}

export default function Dropdown({ variant = "primary", className, disabled, label, name, leftIcon, options = [], value, onChange, error, placeholder = "Select option" }: dropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const dropdownRef = useOutsideClick(setIsOpen, false)

    const filteredOptions = options.filter(option => 
        option.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedOption = options.find(opt => opt.id.toString() === value.toString())

    const handleSelect = (optionId: string | number) => {
        onChange(optionId.toString())
        setIsOpen(false)
        setSearchQuery("")
    }

    return (
        <div className={`relative flex flex-col gap-[2px] ${className}`} ref={dropdownRef}>
                { label ? <label htmlFor={name} className={`font-semibold xl:text-[14px] text-[13px] ${isOpen ? "text-primary" : ""}`}>{label}</label> : "" }

            <div className={`flex items-center relative rounded-[6px] w-full bg-gray-500/[0.04] py-1 border duration-500 
                ${error && !isOpen ?  "border-red-500 text-red-500 " : "border-gray-500/[0.2]"}
                ${isOpen ? "border-primary dark:border-primary shadow-input-active" : ""}
                ${disabled ? "opacity-[0.25] cursor-not-allowed" : "cursor-pointer"}
                ${variant === "primary" ? "pl-[12px] pr-[2px] py-[2px] " : "py-3 px-4 "}
            `}>
                <button
                    type="button"
                    className={`py-1 pr-2 w-full outline-none bg-transparent text-left flex items-center justify-between text-[13px]
                        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    `}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                >
                    <span className={`flex items-center gap-2 truncate ${!selectedOption ? "text-gray/[0.8]" : "text-primary"}`}>
                        {selectedOption?.icon || leftIcon}
                        {selectedOption?.title || placeholder}
                    </span>
                    <span
                        className={`opacity-25 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
                    >
                      <AltArrowDown size={14} />
                    </span>
                </button>

                { error && !isOpen ? <p className="absolute right-2 px-2 text-[12px] bg-white dark:bg-dark-bg text-red-500 backdrop-blur-sm">{error}</p> : "" }
            </div>

            {/* Custom Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-bg border border-gray-500/[0.1] rounded-lg shadow-lg z-50 max-h-[300px] overflow-hidden">
                    {/* Search Input */}
                    {
                        options.length > 9 && (
                            <div className="p-1 border-b border-gray-500/[0.1]">
                                <input
                                    type="text"
                                    className="w-full px-3 py-3 outline-none bg-transparent border border-gray-500/[0.1] rounded focus:border-primary placeholder:text-gray-500"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )
                    }

                    {/* Options List */}
                    <div className="overflow-y-auto max-h-[250px]">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`w-full px-3 py-2 text-start text-[12px] flex items-center gap-2 hover:bg-primary hover:text-white transition-colors
                                        ${option.title === value ? 'bg-primary text-white' : ''}
                                    `}
                                    onClick={() => {handleSelect(option.id); option.onClick?.()}}
                                >
                                    {option.icon}
                                    {option.title}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 opacity-[0.6] text-center">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
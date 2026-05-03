import { XIcon } from "@phosphor-icons/react";
import { useOutsideClick } from "../../customHooks/useOutsideClick";
import Button from "../button/button";

interface ConfirmationMessageProps {
    title: string;
    text: string;
    buttonText: string;
    setOpen: (value: boolean) => void;
    onConfirm: () => void
}

export default function Confirmationmessage({ title, text, buttonText = "Delete", setOpen, onConfirm }: ConfirmationMessageProps) {
    const modalRef = useOutsideClick(setOpen, false)
    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div ref={modalRef} className="bg-white dark:bg-dark flex flex-col justify-between min-w-[300px] max-[420px]:w-[80%] rounded-lg shadow-lg border border-gray-500/[0.2]">
                <div className="sticky top-0 border-b border-gray-500/[0.2] z-[2] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors">
                        <XIcon size={16} />
                    </button>
                    <h2 className="px-4 border-l border-gray-500/[0.1] opacity-[0.7] leading-4">{title}</h2>
                    </div>
                </div>
                <p className='p-4 text-center max-w-[250px] mx-auto text-[12px]'>{text}</p>

                <div className="p-4 flex justify-center items-center gap-4">
                    <Button variant="secondary" size="small" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={onConfirm} size="small">{buttonText}</Button>
                </div>
            </div> 
        </div>
    )
}
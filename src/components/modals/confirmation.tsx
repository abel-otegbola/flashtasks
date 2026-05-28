import { XIcon } from "@phosphor-icons/react";
import { useOutsideClick } from "../../customHooks/useOutsideClick";
import Button from "../button/button";

interface ConfirmationMessageProps {
    title: string;
    text: string;
    buttonText: string;
    setOpen: (value: boolean) => void;
    onConfirm: () => void;
    loading?: boolean;
}

export default function Confirmationmessage({ title, text, buttonText = "Delete", setOpen, onConfirm, loading }: ConfirmationMessageProps) {
    const modalRef = useOutsideClick(setOpen, false)
    return (
        <div className='fixed inset-0 bg-black/30 flex items-center justify-center backdrop-blur-xs p-4 z-50'>
            <div ref={modalRef} className="bg-white dark:bg-dark flex flex-col justify-between sm:w-[400px] w-full max-[460px]:w-[80%] rounded-lg shadow-lg border border-gray-500/[0.2]">
                <div className="sticky top-0 border-b border-gray-500/[0.2] z-[2] p-4 flex items-center justify-between">
                    <h2 className="px-2 opacity-[0.7] leading-4">{title}</h2>
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark rounded-lg transition-colors">
                        <XIcon size={16} />
                    </button>
                </div>
                <p className='p-4 text-center max-w-[250px] mx-auto text-[12px]'>{text}</p>

                <div className="p-4 flex justify-center items-center gap-4 z-5">
                    <Button variant="secondary" size="small" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={onConfirm} size="small" disabled={loading}>
                        {loading ? 'Processing...' : buttonText}
                    </Button>
                </div>
            </div> 
        </div>
    )
}
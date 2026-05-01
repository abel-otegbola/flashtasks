import Button from "../button/button";

interface ConfirmationMessageProps {
    title: string;
    text: string;
    buttonText: string;
    setOpen: (value: boolean) => void;
    onConfirm: () => void
}

export default function Confirmationmessage({ title, text, buttonText = "Delete", setOpen, onConfirm }: ConfirmationMessageProps) {
    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className="bg-background flex flex-col justify-between min-w-[300px] rounded-lg shadow-lg border border-gray-500/[0.2]">
                <div className="p-4 flex justify-between items-center border-b border-gray-500/[0.2]">
                    <h3 className="font-medium text-[16px]">{title}</h3>
                    <button>
                        <i className="la la-times text-lg text-gray-600 cursor-pointer" onClick={() => setOpen(false)}></i>
                    </button>
                </div>
                <p className='p-4 text-center max-w-[250px] mx-auto text-[12px]'>{text}</p>

                <div className="p-4 flex justify-center items-center gap-4">
                    <Button variant="tertiary" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={onConfirm}>{buttonText}</Button>
                </div>
            </div> 
        </div>
    )
}
import { CheckCircleIcon } from "@phosphor-icons/react";

type TaskCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

function TaskCheckbox({
  checked,
  onCheckedChange,
  ariaLabel,
  className = "",
  disabled = false,
}: TaskCheckboxProps) {
  return (
    <label
      className={`inline-flex items-center justify-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onCheckedChange(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="peer sr-only"
      />
      {checked ? (
        <CheckCircleIcon size={20}  className="text-green-500" aria-hidden="true" />
      ) : (
        <span className="h-4 w-4 rounded-full border border-gray-500/[0.3] bg-transparent transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-green-400 peer-focus-visible:ring-offset-2" />
      )}
    </label>
  );
}

export default TaskCheckbox;
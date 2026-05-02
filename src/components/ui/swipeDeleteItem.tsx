import { useRef, useState } from "react";
import { TrashIcon } from "@phosphor-icons/react";

type SwipeDeleteItemProps = {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  className?: string;
  threshold?: number;
  disabled?: boolean;
};

function SwipeDeleteItem({
  children,
  onSwipeLeft,
  className = "",
  threshold = 90,
  disabled = false,
}: SwipeDeleteItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const suppressClickRef = useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.pointerType === "mouse") {
      return;
    }

    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !pointerStartRef.current || pointerStartRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      return;
    }

    if (deltaX < 0) {
      suppressClickRef.current = true;
      setTranslateX(Math.max(deltaX, -120));
    }
  };

  const resetSwipe = () => {
    setTranslateX(0);
    setIsDragging(false);
    pointerStartRef.current = null;

    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !pointerStartRef.current || pointerStartRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - pointerStartRef.current.x;

    if (deltaX <= -threshold) {
      setTranslateX(-120);
      suppressClickRef.current = true;

      window.setTimeout(() => {
        onSwipeLeft();
        resetSwipe();
      }, 80);

      return;
    }

    resetSwipe();
  };

  const handlePointerCancel = () => {
    if (disabled) {
      return;
    }

    resetSwipe();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-center justify-end bg-red-500/95 text-white pr-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <TrashIcon size={16} />
          Delete
        </div>
      </div>

      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 180ms ease-out",
          touchAction: "pan-y",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={(event) => {
          if (suppressClickRef.current) {
            event.stopPropagation();
            event.preventDefault();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeDeleteItem;
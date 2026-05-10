import { useRef, useState } from "react";

type SwipeActionItemProps = {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  className?: string;
  threshold?: number;
  maxReveal?: number;
  disabled?: boolean;
  longPressThreshold?: number;
};

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

/** Returns the % progress toward the threshold (0–1) */
const progress = (translateX: number, threshold: number) =>
  clamp(Math.abs(translateX) / threshold, 0, 1);

function SwipeActionItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  className = "",
  threshold = 90,
  maxReveal = 100,
  disabled = false,
  longPressThreshold = 500,
}: SwipeActionItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const pointerStartRef = useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);
  const suppressClickRef = useRef(false);
  // Track which direction was committed (prevents direction flip mid-swipe)
  const directionLockRef = useRef<"left" | "right" | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  // ── Gesture handlers ──────────────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.pointerType === "mouse") return;

    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
    };
    directionLockRef.current = null;
    longPressTriggeredRef.current = false;
    setIsDragging(true);

    // Start long-press timer
    longPressTimerRef.current = window.setTimeout(() => {
      if (onLongPress && !longPressTriggeredRef.current) {
        longPressTriggeredRef.current = true;
        suppressClickRef.current = true;
        onLongPress();
        resetSwipe();
      }
    }, longPressThreshold);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      disabled ||
      !pointerStartRef.current ||
      pointerStartRef.current.pointerId !== e.pointerId
    )
      return;

    const deltaX = e.clientX - pointerStartRef.current.x;
    const deltaY = e.clientY - pointerStartRef.current.y;

    // Cancel long-press if movement detected
    if ((Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) && longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Cancel if vertical scroll is dominant
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) return;

    // Lock direction on first meaningful horizontal movement
    if (!directionLockRef.current && Math.abs(deltaX) > 6) {
      directionLockRef.current = deltaX < 0 ? "left" : "right";
    }

    const dir = directionLockRef.current;

    if (dir === "left" && onSwipeLeft) {
      suppressClickRef.current = true;
      setTranslateX(clamp(deltaX, -maxReveal, 0));
    } else if (dir === "right" && onSwipeRight) {
      suppressClickRef.current = true;
      setTranslateX(clamp(deltaX, 0, maxReveal));
    }
  };

  const resetSwipe = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setTranslateX(0);
    setIsDragging(false);
    pointerStartRef.current = null;
    directionLockRef.current = null;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      disabled ||
      !pointerStartRef.current ||
      pointerStartRef.current.pointerId !== e.pointerId
    )
      return;

    const deltaX = e.clientX - pointerStartRef.current.x;
    const dir = directionLockRef.current;

    if (dir === "left" && onSwipeLeft && deltaX <= -threshold) {
      // Animate to full reveal, then fire callback
      setTranslateX(-maxReveal);
      suppressClickRef.current = true;
      window.setTimeout(() => {
        onSwipeLeft();
        resetSwipe();
      }, 120);
      return;
    }

    if (dir === "right" && onSwipeRight && deltaX >= threshold) {
      // Animate to full reveal, then fire callback
      setTranslateX(maxReveal);
      suppressClickRef.current = true;
      window.setTimeout(() => {
        onSwipeRight();
        console.log("right")
        resetSwipe();
      }, 120);
      return;
    }

    resetSwipe();
  };

  const handlePointerCancel = () => {
    if (!disabled) resetSwipe();
  };
  
  const leftProgress  = progress(translateX, threshold); // swipe-right (complete)
  const rightProgress = progress(translateX, threshold); // swipe-left  (delete)
  const isSwipingLeft  = translateX < 0;
  const isSwipingRight = translateX > 0;

  return (
    <div className={`relative overflow-hidden ${className}`}>

      {/* ── Swipeable content ── */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 180ms ease-out",
          touchAction: "pan-y",
          willChange: isDragging ? "transform" : "auto",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={(e) => {
          if (suppressClickRef.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeActionItem;
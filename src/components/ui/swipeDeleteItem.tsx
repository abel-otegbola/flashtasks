import { useRef, useState } from "react";
import { TrashIcon, CheckIcon } from "@phosphor-icons/react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SwipeActionItemProps = {
  children: React.ReactNode;
  onSwipeLeft?: () => void;   // delete
  onSwipeRight?: () => void;  // complete
  className?: string;
  threshold?: number;         // px drag needed to trigger action (default 90)
  maxReveal?: number;         // max px the item slides before snapping (default 100)
  disabled?: boolean;
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
  className = "",
  threshold = 90,
  maxReveal = 100,
  disabled = false,
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

  // ── Gesture handlers ──────────────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.pointerType === "mouse") return;

    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
    };
    directionLockRef.current = null;
    setIsDragging(true);
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
        resetSwipe();
      }, 120);
      return;
    }

    resetSwipe();
  };

  const handlePointerCancel = () => {
    if (!disabled) resetSwipe();
  };

  // ── Derived values for indicator rendering ────────────────────────────────

  const leftProgress  = progress(translateX, threshold); // swipe-right (complete)
  const rightProgress = progress(translateX, threshold); // swipe-left  (delete)
  const isSwipingLeft  = translateX < 0;
  const isSwipingRight = translateX > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>

      {/* ── Complete indicator (revealed on swipe right) ── */}
      {onSwipeRight && (
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 flex items-center justify-start px-5"
          style={{
            width: maxReveal,
            background: `rgba(34, 197, 94, ${isSwipingRight ? 0.12 + leftProgress * 0.15 : 0})`,
            transition: isDragging ? "none" : "background 180ms ease-out",
          }}
        >
          <div
            style={{
              opacity: isSwipingRight ? leftProgress : 0,
              transform: `scale(${isSwipingRight ? 0.6 + leftProgress * 0.4 : 0.6})`,
              transition: isDragging ? "none" : "opacity 180ms ease-out, transform 180ms ease-out",
            }}
          >
            <CheckIcon
              size={22}
              weight="bold"
              style={{ color: `rgba(34, 197, 94, ${0.4 + leftProgress * 0.6})` }}
            />
          </div>
        </div>
      )}

      {/* ── Delete indicator (revealed on swipe left) ── */}
      {onSwipeLeft && (
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 flex items-center justify-end px-5"
          style={{
            width: maxReveal,
            background: `rgba(239, 68, 68, ${isSwipingLeft ? 0.12 + rightProgress * 0.15 : 0})`,
            transition: isDragging ? "none" : "background 180ms ease-out",
          }}
        >
          <div
            style={{
              opacity: isSwipingLeft ? rightProgress : 0,
              transform: `scale(${isSwipingLeft ? 0.6 + rightProgress * 0.4 : 0.6})`,
              transition: isDragging ? "none" : "opacity 180ms ease-out, transform 180ms ease-out",
            }}
          >
            <TrashIcon
              size={22}
              weight="bold"
              style={{ color: `rgba(239, 68, 68, ${0.4 + rightProgress * 0.6})` }}
            />
          </div>
        </div>
      )}

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
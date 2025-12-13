// components/BlurReveal.tsx
'use client';

import { 
  useEffect, 
  useRef, 
  useImperativeHandle, 
  forwardRef 
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

type AnimationPreset = 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'scale';

export interface BlurRevealHandle {
  replayAnimation: () => void;
}

interface BlurRevealProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  stagger?: number;
  preset?: AnimationPreset;
  offset?: number;
  blurAmount?: number;
  scaleAmount?: number;
  // Optional: disable scroll trigger (for manual control)
  disableScrollTrigger?: boolean;
}

const BlurReveal = forwardRef<BlurRevealHandle, BlurRevealProps>(({
  children,
  className = '',
  duration = 1.2,
  stagger = 0.06,
  preset = 'slide-up',
  offset = 40,
  blurAmount = 4,
  scaleAmount: propScaleAmount,
  disableScrollTrigger = false,
}, ref) => {
  const textRef = useRef<HTMLDivElement>(null);
  const splitTextRef = useRef<SplitText | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasAnimatedRef = useRef(false);

  // Compute scaleAmount with fallback
  const scaleAmount = propScaleAmount ?? (preset === 'zoom' || preset === 'scale' ? 0.8 : 1);

  // Get initial state based on preset
  const getInitialState = () => {
    switch (preset) {
      case 'slide-up': return { x: 0, y: offset, scale: scaleAmount };
      case 'slide-down': return { x: 0, y: -offset, scale: scaleAmount };
      case 'slide-left': return { x: offset, y: 0, scale: scaleAmount };
      case 'slide-right': return { x: -offset, y: 0, scale: scaleAmount };
      case 'zoom':
      case 'scale': return { x: 0, y: 0, scale: scaleAmount };
      default: return { x: 0, y: offset, scale: scaleAmount };
    }
  };

  // Clean up animation
  const cleanup = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
    if (splitTextRef.current) {
      splitTextRef.current.revert();
      splitTextRef.current = null;
    }
    if (textRef.current) {
      textRef.current.style.opacity = '';
      textRef.current.style.filter = '';
    }
    hasAnimatedRef.current = false;
  };

  // Run animation
  const runAnimation = () => {
    if (!textRef.current || hasAnimatedRef.current) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      textRef.current.style.opacity = '1';
      textRef.current.style.filter = 'blur(0)';
      hasAnimatedRef.current = true;
      return;
    }

    // Clean up previous
    cleanup();

    // Split text
    splitTextRef.current = new SplitText(textRef.current, {
      type: 'words',
      wordsClass: 'word',
    });

    const words = splitTextRef.current.words;
    const initialState = getInitialState();

    // Set initial state
    gsap.set(words, {
      opacity: 0,
      filter: `blur(${blurAmount}px)`,
      ...initialState,
    });

    // Create timeline
    timelineRef.current = gsap.timeline();

    timelineRef.current.to(words, {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      scale: 1,
      duration,
      ease: preset === 'zoom' ? 'back.out(1.7)' : 'expo.out',
      stagger: {
        each: stagger,
        from: 'start',
      },
      onComplete: () => {
        hasAnimatedRef.current = true;
      },
    });

    // Check if element is already in viewport
    const isInViewport = () => {
      if (!textRef.current) return false;
      const rect = textRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      return rect.top <= windowHeight * 0.9 && rect.bottom >= 0;
    };

    // Add scroll trigger if enabled
    if (!disableScrollTrigger && timelineRef.current) {
      if (isInViewport()) {
        // Element already visible, play immediately
        timelineRef.current.play();
      } else {
        // Element not visible, wait for scroll
        ScrollTrigger.create({
          trigger: textRef.current,
          start: 'top 90%',
          end: 'bottom 10%',
          toggleActions: 'play none none none',
          animation: timelineRef.current,
          once: true,
        });
      }
    } else if (disableScrollTrigger && timelineRef.current) {
      // If scroll trigger disabled, play immediately
      timelineRef.current.play();
    }
  };

  // Expose replay function
  useImperativeHandle(ref, () => ({
    replayAnimation: () => {
      hasAnimatedRef.current = false;
      runAnimation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [duration, stagger, preset, offset, blurAmount, scaleAmount, disableScrollTrigger,]);

  // Initial setup
  useEffect(() => {
    runAnimation();

    return () => cleanup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, stagger, preset, offset, blurAmount, scaleAmount, disableScrollTrigger,]);

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  );
});

BlurReveal.displayName = 'BlurReveal';
export default BlurReveal;
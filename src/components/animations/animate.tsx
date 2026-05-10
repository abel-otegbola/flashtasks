'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type AnimationPreset =
  | 'blurIn'
  | 'burIn'
  | 'zoomIn'
  | 'fadeIn'
  | 'scaleUp'
  | 'scalesUp'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight';

export interface AnimateHandle {
  replayAnimation: () => void;
}

interface AnimateProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  preset?: AnimationPreset;
  offset?: number;
  blurAmount?: number;
  scaleAmount?: number;
  disableScrollTrigger?: boolean;
}

const resolvePreset = (preset: AnimationPreset, offset: number, blurAmount: number, scaleAmount: number) => {
  switch (preset) {
    case 'blurIn':
    case 'burIn':
      return { from: { opacity: 0, y: offset, scale: 0.96, filter: `blur(${blurAmount}px)` }, ease: 'power3.out' };
    case 'zoomIn':
      return { from: { opacity: 0, scale: scaleAmount }, ease: 'back.out(1.7)' };
    case 'fadeIn':
      return { from: { opacity: 0 }, ease: 'power2.out' };
    case 'scaleUp':
    case 'scalesUp':
      return { from: { opacity: 0, scale: scaleAmount }, ease: 'power3.out' };
    case 'slideDown':
      return { from: { opacity: 0, y: -offset }, ease: 'power3.out' };
    case 'slideLeft':
      return { from: { opacity: 0, x: offset }, ease: 'power3.out' };
    case 'slideRight':
      return { from: { opacity: 0, x: -offset }, ease: 'power3.out' };
    case 'slideUp':
    default:
      return { from: { opacity: 0, y: offset }, ease: 'power3.out' };
  }
};

const shouldDisableScrollTriggerOnThisViewport = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  return window.matchMedia('(max-width: 767px)').matches;
};

const Animate = forwardRef<AnimateHandle, AnimateProps>(({ 
  children,
  className = '',
  duration = 0.9,
  delay = 0,
  preset = 'blurIn',
  offset = 28,
  blurAmount = 10,
  scaleAmount: propScaleAmount,
  disableScrollTrigger = false,
}, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const hasAnimatedRef = useRef(false);

  const scaleAmount = propScaleAmount ?? (preset === 'zoomIn' || preset === 'scaleUp' || preset === 'scalesUp' ? 0.85 : 1);

  const cleanup = () => {
    timelineRef.current?.kill();
    timelineRef.current = null;

    scrollTriggerRef.current?.kill();
    scrollTriggerRef.current = null;

    if (wrapperRef.current) {
      gsap.set(wrapperRef.current, {
        clearProps: 'opacity,transform,filter',
      });
    }

    hasAnimatedRef.current = false;
  };

  const runAnimation = () => {
    if (!wrapperRef.current || hasAnimatedRef.current) return;

    cleanup();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const disableScrollTriggerForViewport = disableScrollTrigger || shouldDisableScrollTriggerOnThisViewport();

    if (reduceMotion) {
      gsap.set(wrapperRef.current, { clearProps: 'opacity,transform,filter' });
      hasAnimatedRef.current = true;
      return;
    }

    const { from, ease } = resolvePreset(preset, offset, blurAmount, scaleAmount);

    gsap.set(wrapperRef.current, from);

    timelineRef.current = gsap.timeline({ paused: true, delay }).to(wrapperRef.current, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration,
      ease,
      onComplete: () => {
        hasAnimatedRef.current = true;
      },
    });

    const playAnimation = () => {
      timelineRef.current?.play(0);
    };

    if (disableScrollTriggerForViewport) {
      playAnimation();
      return;
    }

    const triggerElement = wrapperRef.current;
    if (!triggerElement.isConnected) {
      return;
    }

    const rect = triggerElement.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const isInViewport = rect.top <= windowHeight * 0.9 && rect.bottom >= 0;

    if (isInViewport) {
      playAnimation();
      return;
    }

    scrollTriggerRef.current && scrollTriggerRef.current.kill();
    scrollTriggerRef.current = ScrollTrigger?.create({
      trigger: triggerElement,
      start: 'top 90%',
      end: 'bottom 10%',
      once: true,
      onEnter: playAnimation,
    });
  };

  useImperativeHandle(ref, () => ({
    replayAnimation: () => {
      hasAnimatedRef.current = false;
      runAnimation();
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [duration, delay, preset, offset, blurAmount, scaleAmount, disableScrollTrigger]);

  useEffect(() => {
    runAnimation();

    return () => cleanup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, delay, preset, offset, blurAmount, scaleAmount, disableScrollTrigger]);

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
});

Animate.displayName = 'Animate';

export default Animate;
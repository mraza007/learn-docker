'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  once?: boolean;
  duration?: number;
  distance?: number;
}

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  once = true,
  duration = 800,
  distance = 40,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getInitialTransform = () => {
      switch (direction) {
        case 'up':
          return { translateY: distance };
        case 'down':
          return { translateY: -distance };
        case 'left':
          return { translateX: distance };
        case 'right':
          return { translateX: -distance };
        default:
          return {};
      }
    };

    // Set initial state
    anime.set(element, {
      opacity: 0,
      ...getInitialTransform(),
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!once || !hasAnimated)) {
            anime({
              targets: element,
              opacity: [0, 1],
              translateX: direction === 'left' ? [distance, 0] : direction === 'right' ? [-distance, 0] : 0,
              translateY: direction === 'up' ? [distance, 0] : direction === 'down' ? [-distance, 0] : 0,
              duration,
              delay: delay * 1000,
              easing: 'easeOutExpo',
            });
            setHasAnimated(true);
            if (once) {
              observer.unobserve(element);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay, direction, once, hasAnimated, duration, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

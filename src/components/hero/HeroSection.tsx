'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { Box, Container, Layers, Network, Server } from 'lucide-react';

const FloatingIcon = ({
  Icon,
  className,
  delay
}: {
  Icon: React.ComponentType<{ className?: string }>;
  className: string;
  delay: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    anime({
      targets: ref.current,
      translateY: [
        { value: -20, duration: 2000 },
        { value: 20, duration: 2000 },
        { value: -20, duration: 2000 },
      ],
      translateX: [
        { value: 10, duration: 3000 },
        { value: -10, duration: 3000 },
        { value: 10, duration: 3000 },
      ],
      rotate: [
        { value: 5, duration: 2500 },
        { value: -5, duration: 2500 },
        { value: 5, duration: 2500 },
      ],
      opacity: [
        { value: 0, duration: 0 },
        { value: 0.6, duration: 1000 },
      ],
      scale: [
        { value: 0.8, duration: 0 },
        { value: 1, duration: 800 },
      ],
      loop: true,
      easing: 'easeInOutSine',
      delay,
    });
  }, [delay]);

  return (
    <div ref={ref} className={`absolute opacity-0 ${className}`}>
      <Icon className="w-8 h-8 text-primary/30" />
    </div>
  );
};

// Techy animated terminal/container icon
const TechIcon = () => {
  const iconRef = useRef<SVGSVGElement>(null);
  const cursorRef = useRef<SVGRectElement>(null);
  const dataFlowRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!iconRef.current) return;

    // Cursor blink
    if (cursorRef.current) {
      anime({
        targets: cursorRef.current,
        opacity: [1, 0],
        duration: 530,
        loop: true,
        easing: 'steps(1)',
      });
    }

    // Data flow particles
    if (dataFlowRef.current) {
      const particles = dataFlowRef.current.querySelectorAll('.data-particle');
      anime({
        targets: particles,
        translateX: [0, 60],
        opacity: [0, 1, 1, 0],
        duration: 1500,
        delay: anime.stagger(300),
        loop: true,
        easing: 'linear',
      });
    }

    // Subtle pulse on container
    anime({
      targets: iconRef.current.querySelector('.container-glow'),
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.02, 1],
      duration: 2000,
      loop: true,
      easing: 'easeInOutSine',
    });
  }, []);

  return (
    <svg
      ref={iconRef}
      viewBox="0 0 100 80"
      className="w-24 h-20 md:w-32 md:h-24"
      fill="none"
    >
      {/* Main container box */}
      <rect x="20" y="15" width="60" height="50" rx="4" className="fill-surface stroke-primary/50" strokeWidth="2" />
      <rect x="20" y="15" width="60" height="50" rx="4" className="container-glow fill-primary/10" />

      {/* Terminal header bar */}
      <rect x="20" y="15" width="60" height="12" rx="4" className="fill-primary/20" />
      <rect x="20" y="23" width="60" height="4" className="fill-primary/20" />
      <circle cx="28" cy="21" r="2" className="fill-danger/70" />
      <circle cx="35" cy="21" r="2" className="fill-warning/70" />
      <circle cx="42" cy="21" r="2" className="fill-primary/70" />

      {/* Terminal content - code lines */}
      <rect x="26" y="32" width="20" height="2" rx="1" className="fill-primary/60" />
      <rect x="26" y="38" width="35" height="2" rx="1" className="fill-muted/40" />
      <rect x="26" y="44" width="28" height="2" rx="1" className="fill-secondary/50" />
      <rect x="26" y="50" width="15" height="2" rx="1" className="fill-primary/60" />

      {/* Cursor */}
      <rect ref={cursorRef} x="43" y="50" width="6" height="2" rx="1" className="fill-primary" />

      {/* Data flow lines on sides */}
      <g ref={dataFlowRef}>
        {/* Left side incoming */}
        <line x1="5" y1="40" x2="20" y2="40" className="stroke-primary/20" strokeWidth="1" strokeDasharray="2 2" />
        <circle className="data-particle fill-primary" cx="5" cy="40" r="2" opacity="0" />
        <circle className="data-particle fill-secondary" cx="5" cy="40" r="2" opacity="0" />
        <circle className="data-particle fill-primary" cx="5" cy="40" r="2" opacity="0" />
      </g>

      {/* Right side outgoing */}
      <line x1="80" y1="40" x2="95" y2="40" className="stroke-primary/20" strokeWidth="1" strokeDasharray="2 2" />

      {/* Corner brackets for tech feel */}
      <path d="M15 20 L15 15 L20 15" className="stroke-primary/40" strokeWidth="1.5" fill="none" />
      <path d="M85 20 L85 15 L80 15" className="stroke-primary/40" strokeWidth="1.5" fill="none" />
      <path d="M15 60 L15 65 L20 65" className="stroke-primary/40" strokeWidth="1.5" fill="none" />
      <path d="M85 60 L85 65 L80 65" className="stroke-primary/40" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Title letter animation
    if (titleRef.current) {
      const text = titleRef.current.innerText;
      titleRef.current.innerHTML = text
        .split('')
        .map((char, i) =>
          char === ' '
            ? ' '
            : `<span class="inline-block opacity-0">${char}</span>`
        )
        .join('');

      anime({
        targets: titleRef.current.querySelectorAll('span'),
        opacity: [0, 1],
        translateY: [50, 0],
        rotateX: [-90, 0],
        duration: 1200,
        delay: anime.stagger(50, { start: 300 }),
        easing: 'easeOutExpo',
      });
    }

    // Subtitle animation
    if (subtitleRef.current) {
      anime({
        targets: subtitleRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        delay: 1000,
        easing: 'easeOutExpo',
      });
    }

    // Description animation
    if (descRef.current) {
      anime({
        targets: descRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: 1400,
        easing: 'easeOutExpo',
      });
    }

    // Interactive container animation
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 1000,
        delay: 1800,
        easing: 'easeOutElastic(1, 0.5)',
      });
    }

    // Scroll indicator
    if (scrollRef.current) {
      anime({
        targets: scrollRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 800,
        delay: 2200,
        easing: 'easeOutExpo',
      });

      // Bounce animation for scroll indicator
      anime({
        targets: scrollRef.current.querySelector('.scroll-dot'),
        translateY: [0, 12, 0],
        duration: 1500,
        loop: true,
        easing: 'easeInOutSine',
        delay: 2500,
      });
    }
  }, [mounted]);

  const handleContainerHover = () => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        scale: [1, 1.05, 1],
        rotateY: [0, 10, 0],
        duration: 600,
        easing: 'easeOutElastic(1, 0.5)',
      });
    }
  };

  const scrollToContent = () => {
    const firstSection = document.getElementById('layer-0');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 159, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 159, 1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating icons */}
      <FloatingIcon Icon={Box} className="top-[15%] left-[10%]" delay={0} />
      <FloatingIcon Icon={Container} className="top-[20%] right-[15%]" delay={400} />
      <FloatingIcon Icon={Layers} className="bottom-[30%] left-[8%]" delay={800} />
      <FloatingIcon Icon={Network} className="bottom-[25%] right-[12%]" delay={1200} />
      <FloatingIcon Icon={Server} className="top-[40%] left-[5%]" delay={1600} />
      <FloatingIcon Icon={Box} className="top-[35%] right-[8%]" delay={2000} />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="text-center relative z-10 max-w-4xl mx-auto">
        {/* Tech icon + title */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
          <TechIcon />
          <div>
            <h1
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary tracking-tight"
              style={{ perspective: '1000px' }}
            >
              Docker
            </h1>
            <div className="text-xl md:text-2xl font-bold text-text tracking-wide">
              Made Easy
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div
          ref={subtitleRef}
          className="text-lg md:text-2xl font-mono text-muted mb-6 opacity-0"
        >
          Learn Docker Internals and How It Works
        </div>

        {/* Tagline */}
        <p
          ref={descRef}
          className="text-base md:text-lg text-muted/70 max-w-xl mx-auto mb-12 opacity-0"
        >
          An interactive tutorial that teaches you Docker from the ground up.
        </p>

        {/* Interactive container preview */}
        <div
          ref={containerRef}
          className="opacity-0 mb-16 cursor-pointer"
          onMouseEnter={handleContainerHover}
          onClick={scrollToContent}
        >
          <div className="inline-flex items-center gap-4 bg-surface/50 backdrop-blur-sm border border-primary/30 rounded-2xl px-8 py-6 hover:border-primary/60 transition-colors group">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors font-mono text-primary text-2xl">
                $&gt;
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full" />
            </div>
            <div className="text-left">
              <div className="text-primary font-mono text-sm mb-1">docker run --interactive</div>
              <div className="text-text font-semibold">Start Learning</div>
            </div>
            <div className="ml-4 text-primary">
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 cursor-pointer"
        onClick={scrollToContent}
      >
        <div className="flex flex-col items-center gap-3 text-muted hover:text-primary transition-colors">
          <span className="text-sm font-mono">Scroll to begin</span>
          <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1.5">
            <div className="scroll-dot w-1.5 h-1.5 rounded-full bg-current" />
          </div>
        </div>
      </div>
    </section>
  );
}

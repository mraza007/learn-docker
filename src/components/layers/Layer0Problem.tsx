'use client';

import { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { Terminal, FadeIn } from '@/components/ui';
import { useProgressStore } from '@/stores/progressStore';

const terminalLines = [
  { type: 'command' as const, content: 'python app.py' },
  { type: 'output' as const, content: 'Loading dependencies...', delay: 800 },
  { type: 'error' as const, content: 'ModuleNotFoundError: No module named \'pandas\'', delay: 400 },
  { type: 'error' as const, content: 'Traceback (most recent call last):', delay: 100 },
  { type: 'error' as const, content: '  File "app.py", line 1, in <module>', delay: 100 },
  { type: 'error' as const, content: '    import pandas as pd', delay: 100 },
];

export function Layer0Problem() {
  const [terminalComplete, setTerminalComplete] = useState(false);
  const unlockLayer = useProgressStore((state) => state.unlockLayer);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const explanationRef = useRef<HTMLParagraphElement>(null);
  const solutionRef = useRef<HTMLParagraphElement>(null);

  // Auto-unlock Layer 1 after the content is shown
  useEffect(() => {
    if (terminalComplete) {
      const timer = setTimeout(() => {
        unlockLayer(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [terminalComplete, unlockLayer]);

  // Animate quote and follow-up text when terminal completes
  useEffect(() => {
    if (terminalComplete && quoteRef.current) {
      // Animate quote
      anime({
        targets: quoteRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        easing: 'easeOutExpo',
      });

      // Animate explanation
      if (explanationRef.current) {
        anime({
          targets: explanationRef.current,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
          delay: 500,
          easing: 'easeOutExpo',
        });
      }

      // Animate solution
      if (solutionRef.current) {
        anime({
          targets: solutionRef.current,
          opacity: [0, 1],
          translateY: [20, 0],
          scale: [0.95, 1],
          duration: 800,
          delay: 1000,
          easing: 'easeOutExpo',
        });
      }
    }
  }, [terminalComplete]);

  return (
    <section id="layer-0" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Opening */}
        <FadeIn className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-text mb-4">
            The <span className="text-danger">Problem</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Before we understand containers, let&apos;s see why they&apos;re needed.
          </p>
        </FadeIn>

        {/* Terminal Demo */}
        <FadeIn delay={0.3} className="mb-16">
          <Terminal
            lines={terminalLines}
            onComplete={() => setTerminalComplete(true)}
            className="max-w-2xl mx-auto"
          />
        </FadeIn>

        {/* The infamous quote */}
        {terminalComplete && (
          <div className="text-center mb-12">
            <blockquote
              ref={quoteRef}
              className="text-2xl md:text-3xl font-mono text-text italic opacity-0"
            >
              &ldquo;But it <span className="text-primary">works</span> on my machine...&rdquo;
            </blockquote>
            <p
              ref={explanationRef}
              className="text-muted mt-4 mb-8 opacity-0"
            >
              This happens when code works on one machine but fails on another due to different environments.
            </p>
            <p
              ref={solutionRef}
              className="text-xl text-text font-mono opacity-0"
            >
              Containers solve this by letting you <span className="text-primary">package your entire environment</span>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

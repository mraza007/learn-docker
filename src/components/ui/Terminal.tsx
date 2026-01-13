'use client';

import { useState, useEffect, useRef } from 'react';
import anime from 'animejs';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
  delay?: number;
}

interface TerminalProps {
  lines: TerminalLine[];
  autoPlay?: boolean;
  onComplete?: () => void;
  showPrompt?: boolean;
  className?: string;
}

export function Terminal({
  lines,
  autoPlay = true,
  onComplete,
  showPrompt = true,
  className = '',
}: TerminalProps) {
  const [displayedLines, setDisplayedLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const headerDotsRef = useRef<HTMLDivElement>(null);

  // Animate terminal entrance
  useEffect(() => {
    if (terminalRef.current) {
      anime({
        targets: terminalRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'easeOutExpo',
      });
    }

    // Animate header dots
    if (headerDotsRef.current) {
      anime({
        targets: headerDotsRef.current.children,
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(100, { start: 300 }),
        duration: 400,
        easing: 'easeOutElastic(1, 0.5)',
      });
    }
  }, []);

  // Cursor blink animation
  useEffect(() => {
    if (cursorRef.current) {
      anime({
        targets: cursorRef.current,
        opacity: [1, 0, 1],
        duration: 1000,
        loop: true,
        easing: 'steps(2)',
      });
    }
  }, [isTyping, currentLineIndex]);

  useEffect(() => {
    if (!autoPlay || currentLineIndex >= lines.length) {
      if (currentLineIndex >= lines.length && onComplete) {
        onComplete();
      }
      return;
    }

    const currentLine = lines[currentLineIndex];
    const delay = currentLine.delay || 0;

    const delayTimeout = setTimeout(() => {
      if (currentLine.type === 'command') {
        setIsTyping(true);
        if (currentCharIndex < currentLine.content.length) {
          const typeTimeout = setTimeout(() => {
            setCurrentCharIndex((prev) => prev + 1);
          }, 25 + Math.random() * 25);
          return () => clearTimeout(typeTimeout);
        } else {
          setDisplayedLines((prev) => [...prev, currentLine]);
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
          setIsTyping(false);
        }
      } else {
        setDisplayedLines((prev) => [...prev, currentLine]);
        setCurrentLineIndex((prev) => prev + 1);
      }
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [autoPlay, currentLineIndex, currentCharIndex, lines, onComplete]);

  const currentLine = lines[currentLineIndex];
  const typingText = currentLine?.type === 'command'
    ? currentLine.content.slice(0, currentCharIndex)
    : '';

  return (
    <div
      ref={terminalRef}
      className={`bg-terminal rounded-xl border border-muted/30 overflow-hidden shadow-2xl opacity-0 ${className}`}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-surface/50 border-b border-muted/30">
        <div ref={headerDotsRef} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger opacity-0 hover:brightness-125 transition-all cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-warning opacity-0 hover:brightness-125 transition-all cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-primary opacity-0 hover:brightness-125 transition-all cursor-pointer" />
        </div>
        <span className="ml-3 text-xs text-muted font-mono tracking-wider">terminal</span>
      </div>

      {/* Terminal content */}
      <div className="p-5 font-mono text-sm min-h-[140px] leading-relaxed">
        {/* Previously typed lines */}
        {displayedLines.map((line, index) => (
          <div key={index} className="mb-1.5">
            {line.type === 'command' && showPrompt && (
              <span className="text-primary mr-2">$</span>
            )}
            <span
              className={
                line.type === 'error'
                  ? 'text-danger'
                  : line.type === 'command'
                  ? 'text-text'
                  : 'text-muted'
              }
            >
              {line.content}
            </span>
          </div>
        ))}

        {/* Currently typing line */}
        {isTyping && currentLine && (
          <div className="mb-1.5">
            {showPrompt && <span className="text-primary mr-2">$</span>}
            <span className="text-text">{typingText}</span>
            <span ref={cursorRef} className="text-primary ml-0.5">▋</span>
          </div>
        )}

        {/* Idle cursor */}
        {!isTyping && currentLineIndex >= lines.length && showPrompt && (
          <div>
            <span className="text-primary mr-2">$</span>
            <span ref={cursorRef} className="text-primary">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}

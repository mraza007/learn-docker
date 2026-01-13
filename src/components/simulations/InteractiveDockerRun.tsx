'use client';

import { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import {
  Terminal as TerminalIcon,
  Server,
  Cloud,
  Search,
  Download,
  Box,
  Play,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

type CommandPart = 'docker' | 'run' | 'hello-world' | null;
type JourneyStep = 0 | 1 | 2 | 3 | 4 | 5;

const commandParts = {
  docker: {
    label: 'docker',
    title: 'Docker CLI',
    description: 'The command-line interface that lets you talk to the Docker daemon. Every Docker command starts with this.',
    color: 'primary',
  },
  run: {
    label: 'run',
    title: 'Run Command',
    description: 'Creates a new container from an image AND starts it. This is the most common Docker command you\'ll use.',
    color: 'secondary',
  },
  'hello-world': {
    label: 'hello-world',
    title: 'Image Name',
    description: 'The name of the Docker image to run. Docker will look for this locally first, then pull from Docker Hub if not found.',
    color: 'warning',
  },
};

const journeySteps = [
  {
    icon: TerminalIcon,
    title: 'You run the command',
    description: 'CLI sends request to Docker daemon',
    color: 'primary',
  },
  {
    icon: Server,
    title: 'Docker daemon receives',
    description: 'The daemon processes your request',
    color: 'secondary',
  },
  {
    icon: Search,
    title: 'Check local images',
    description: 'Looking for hello-world locally...',
    color: 'warning',
  },
  {
    icon: Cloud,
    title: 'Pull from Docker Hub',
    description: 'Image not found! Downloading from registry...',
    color: 'danger',
  },
  {
    icon: Box,
    title: 'Create container',
    description: 'Building container from image layers',
    color: 'secondary',
  },
  {
    icon: Play,
    title: 'Run & Output',
    description: 'Container executes and prints "Hello from Docker!"',
    color: 'primary',
  },
];

export function InteractiveDockerRun({ onComplete }: { onComplete?: () => void }) {
  const [selectedPart, setSelectedPart] = useState<CommandPart>(null);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<JourneyStep>(0);
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  const commandRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Animate tooltip appearance
  useEffect(() => {
    if (selectedPart && tooltipRef.current) {
      anime({
        targets: tooltipRef.current,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 300,
        easing: 'easeOutExpo',
      });
    }
  }, [selectedPart]);

  // Journey animation
  useEffect(() => {
    if (!journeyStarted) return;

    const terminalLines = [
      'Unable to find image \'hello-world:latest\' locally',
      'latest: Pulling from library/hello-world',
      '2db29710123e: Pull complete',
      'Digest: sha256:2498fce14358aa50ead0cc6c19990fc6ff866ce72...',
      '',
      'Hello from Docker!',
      'This message shows that your installation is working.',
    ];

    const stepDurations = [800, 600, 800, 1200, 800, 600];
    let totalDelay = 0;

    journeySteps.forEach((_, index) => {
      setTimeout(() => {
        setCurrentStep(index as JourneyStep);

        // Animate the step
        const stepEl = journeyRef.current?.querySelector(`[data-step="${index}"]`);
        if (stepEl) {
          anime({
            targets: stepEl,
            scale: [0.9, 1.05, 1],
            duration: 400,
            easing: 'easeOutElastic(1, 0.8)',
          });
        }

        // Add terminal output at specific steps
        if (index === 2) {
          setTerminalOutput([terminalLines[0]]);
        } else if (index === 3) {
          setTerminalOutput(terminalLines.slice(0, 4));
        } else if (index === 5) {
          setTerminalOutput(terminalLines);
          setTimeout(() => {
            setJourneyComplete(true);
            onComplete?.();
          }, 500);
        }
      }, totalDelay);
      totalDelay += stepDurations[index];
    });
  }, [journeyStarted, onComplete]);

  const startJourney = () => {
    setJourneyStarted(true);
    setSelectedPart(null);
    setTerminalOutput(['$ docker run hello-world']);
  };

  const resetJourney = () => {
    setJourneyStarted(false);
    setCurrentStep(0);
    setJourneyComplete(false);
    setTerminalOutput([]);
  };

  const getPartColor = (part: CommandPart) => {
    if (!part) return '';
    const colors = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      warning: 'text-warning',
      danger: 'text-danger',
    };
    return colors[commandParts[part].color as keyof typeof colors];
  };

  const getPartBgColor = (part: CommandPart) => {
    if (!part) return '';
    const colors = {
      primary: 'bg-primary/20 border-primary/50',
      secondary: 'bg-secondary/20 border-secondary/50',
      warning: 'bg-warning/20 border-warning/50',
      danger: 'bg-danger/20 border-danger/50',
    };
    return colors[commandParts[part].color as keyof typeof colors];
  };

  return (
    <div className="space-y-8">
      {/* Interactive Command */}
      <div className="bg-terminal rounded-xl border border-muted/30 overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface/50 border-b border-muted/30">
          <div className="w-3 h-3 rounded-full bg-danger" />
          <div className="w-3 h-3 rounded-full bg-warning" />
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="ml-3 text-xs text-muted font-mono">terminal</span>
        </div>

        {/* Command area */}
        <div className="p-6">
          <p className="text-xs text-muted mb-4 font-mono">Click each part to learn what it does:</p>

          <div ref={commandRef} className="flex items-center gap-1 text-lg font-mono mb-6">
            <span className="text-primary mr-2">$</span>
            {(['docker', 'run', 'hello-world'] as const).map((part) => (
              <button
                key={part}
                onClick={() => setSelectedPart(selectedPart === part ? null : part)}
                className={`px-2 py-1 rounded transition-all ${
                  selectedPart === part
                    ? `${getPartBgColor(part)} border`
                    : 'hover:bg-muted/20'
                } ${getPartColor(part)}`}
              >
                {part}
              </button>
            ))}
          </div>

          {/* Tooltip */}
          {selectedPart && (
            <div
              ref={tooltipRef}
              className={`p-4 rounded-lg border opacity-0 ${getPartBgColor(selectedPart)}`}
            >
              <h4 className={`font-mono font-bold mb-1 ${getPartColor(selectedPart)}`}>
                {commandParts[selectedPart].title}
              </h4>
              <p className="text-sm text-muted">
                {commandParts[selectedPart].description}
              </p>
            </div>
          )}

          {/* Run button */}
          {!journeyStarted && (
            <button
              onClick={startJourney}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg font-mono text-sm hover:bg-primary/30 transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Command
            </button>
          )}

          {/* Terminal output */}
          {terminalOutput.length > 0 && (
            <div className="mt-4 pt-4 border-t border-muted/30">
              {terminalOutput.map((line, index) => (
                <div
                  key={index}
                  className={`font-mono text-sm ${
                    line.startsWith('$') ? 'text-text' :
                    line.includes('Hello') ? 'text-primary font-bold' :
                    line.includes('Pull complete') ? 'text-secondary' :
                    'text-muted'
                  }`}
                >
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Journey */}
      {journeyStarted && (
        <div className="bg-surface rounded-xl p-6 border border-muted/30">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-mono text-sm text-text">What&apos;s Happening</h4>
            {journeyComplete && (
              <button
                onClick={resetJourney}
                className="text-xs text-muted hover:text-text font-mono transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div ref={journeyRef} className="relative">
            {/* Connection line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted/20" />
            <div
              className="absolute top-6 left-6 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / 5) * (100 - 12)}%` }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={index}
                    data-step={index}
                    className={`flex flex-col items-center text-center w-20 transition-all duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? `bg-${step.color}/30 border-2 border-${step.color} shadow-lg`
                          : isActive
                          ? `bg-${step.color}/20 border border-${step.color}/50`
                          : 'bg-muted/20 border border-muted/30'
                      }`}
                      style={{
                        backgroundColor: isCurrent ? `var(--${step.color})20` : undefined,
                        borderColor: isActive ? `var(--${step.color})` : undefined,
                      }}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? `text-${step.color}` : 'text-muted'}`} />
                      )}
                    </div>
                    <p className={`mt-2 text-xs font-mono ${isCurrent ? 'text-text' : 'text-muted'}`}>
                      {step.title}
                    </p>
                    {isCurrent && (
                      <p className="mt-1 text-[10px] text-muted max-w-[100px]">
                        {step.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Journey complete message */}
          {journeyComplete && (
            <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/30 text-center">
              <CheckCircle className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-primary font-mono">Container ran successfully!</p>
              <p className="text-xs text-muted mt-1">
                The whole process took milliseconds. That&apos;s the power of containers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Key insight */}
      {journeyComplete && (
        <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
          <p className="text-sm text-muted">
            <span className="text-secondary font-mono font-bold">Key insight:</span> Docker didn&apos;t
            boot an OS or start a VM. It just created an isolated process using the host&apos;s kernel.
            That&apos;s why it was so fast!
          </p>
        </div>
      )}
    </div>
  );
}

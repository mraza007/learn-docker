'use client';

import { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import {
  GripVertical,
  Package,
  Code,
  Settings,
  Database,
  Plus,
  Trash2,
  CheckCircle,
  Layers
} from 'lucide-react';

interface DockerInstruction {
  id: string;
  type: 'FROM' | 'RUN' | 'COPY' | 'CMD';
  content: string;
  description: string;
  size: number; // MB
  color: string;
  icon: React.ElementType;
}

const AVAILABLE_INSTRUCTIONS: DockerInstruction[] = [
  {
    id: 'from-python',
    type: 'FROM',
    content: 'python:3.11-slim',
    description: 'Base Python image',
    size: 50,
    color: 'secondary',
    icon: Database,
  },
  {
    id: 'from-node',
    type: 'FROM',
    content: 'node:20-alpine',
    description: 'Base Node.js image',
    size: 40,
    color: 'secondary',
    icon: Database,
  },
  {
    id: 'run-pip',
    type: 'RUN',
    content: 'pip install flask pandas',
    description: 'Install Python packages',
    size: 120,
    color: 'warning',
    icon: Package,
  },
  {
    id: 'run-npm',
    type: 'RUN',
    content: 'npm install',
    description: 'Install Node packages',
    size: 80,
    color: 'warning',
    icon: Package,
  },
  {
    id: 'copy-app',
    type: 'COPY',
    content: '. /app',
    description: 'Copy application code',
    size: 5,
    color: 'primary',
    icon: Code,
  },
  {
    id: 'copy-config',
    type: 'COPY',
    content: 'config.json /app/',
    description: 'Copy configuration',
    size: 0.1,
    color: 'primary',
    icon: Code,
  },
  {
    id: 'cmd-python',
    type: 'CMD',
    content: '["python", "app.py"]',
    description: 'Run Python app',
    size: 0,
    color: 'muted',
    icon: Settings,
  },
  {
    id: 'cmd-node',
    type: 'CMD',
    content: '["node", "server.js"]',
    description: 'Run Node server',
    size: 0,
    color: 'muted',
    icon: Settings,
  },
];

interface BuiltLayer {
  instruction: DockerInstruction;
  hash: string;
  cumulativeSize: number;
}

export function InteractiveLayerBuilder({ onComplete }: { onComplete?: () => void }) {
  const [builtLayers, setBuiltLayers] = useState<BuiltLayer[]>([]);
  const [draggingInstruction, setDraggingInstruction] = useState<DockerInstruction | null>(null);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const layerStackRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Generate fake hash
  const generateHash = () => {
    return Array.from({ length: 12 }, () =>
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
  };

  // Animate new layer
  const animateNewLayer = (index: number) => {
    const layerEl = layerStackRef.current?.querySelector(`[data-layer="${index}"]`);
    if (layerEl) {
      anime({
        targets: layerEl,
        scaleY: [0, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutElastic(1, 0.8)',
      });
    }
  };

  // Check if image is complete
  useEffect(() => {
    const hasFrom = builtLayers.some(l => l.instruction.type === 'FROM');
    const hasCmd = builtLayers.some(l => l.instruction.type === 'CMD');
    const hasAtLeastThreeLayers = builtLayers.length >= 3;

    if (hasFrom && hasCmd && hasAtLeastThreeLayers && !showSuccess) {
      setShowSuccess(true);

      setTimeout(() => {
        if (successRef.current) {
          anime({
            targets: successRef.current,
            opacity: [0, 1],
            translateY: [20, 0],
            scale: [0.9, 1],
            duration: 500,
            easing: 'easeOutExpo',
          });
        }
        onComplete?.();
      }, 300);
    }
  }, [builtLayers, showSuccess, onComplete]);

  const handleDragStart = (instruction: DockerInstruction) => {
    setDraggingInstruction(instruction);
  };

  const handleDragEnd = () => {
    setDraggingInstruction(null);
    setIsDropZoneActive(false);
  };

  const handleDrop = () => {
    if (!draggingInstruction) return;

    // Validate: FROM must be first
    if (builtLayers.length === 0 && draggingInstruction.type !== 'FROM') {
      // Show error feedback
      const dropZone = layerStackRef.current;
      if (dropZone) {
        anime({
          targets: dropZone,
          translateX: [-10, 10, -10, 10, 0],
          duration: 400,
          easing: 'easeInOutSine',
        });
      }
      setDraggingInstruction(null);
      setIsDropZoneActive(false);
      return;
    }

    // Calculate cumulative size
    const previousSize = builtLayers.length > 0
      ? builtLayers[builtLayers.length - 1].cumulativeSize
      : 0;

    const newLayer: BuiltLayer = {
      instruction: draggingInstruction,
      hash: generateHash(),
      cumulativeSize: previousSize + draggingInstruction.size,
    };

    setBuiltLayers(prev => [...prev, newLayer]);

    // Animate after state update
    setTimeout(() => animateNewLayer(builtLayers.length), 50);

    setDraggingInstruction(null);
    setIsDropZoneActive(false);
  };

  const removeLayer = (index: number) => {
    // Remove this layer and all layers above it (they depend on this one)
    setBuiltLayers(prev => prev.slice(0, index));
  };

  const reset = () => {
    setBuiltLayers([]);
    setShowSuccess(false);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'secondary': return 'bg-secondary/20 border-secondary/50 text-secondary';
      case 'warning': return 'bg-warning/20 border-warning/50 text-warning';
      case 'primary': return 'bg-primary/20 border-primary/50 text-primary';
      case 'muted': return 'bg-muted/20 border-muted/50 text-muted';
      default: return 'bg-muted/20 border-muted/50 text-muted';
    }
  };

  const usedInstructionIds = builtLayers.map(l => l.instruction.id);
  const availableInstructions = AVAILABLE_INSTRUCTIONS.filter(
    i => !usedInstructionIds.includes(i.id)
  );

  return (
    <div className="space-y-6">
      {/* Available Instructions */}
      <div className="bg-surface rounded-xl p-6 border border-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-sm text-text">Dockerfile Instructions</h4>
          {builtLayers.length > 0 && (
            <button
              onClick={reset}
              className="text-xs text-muted hover:text-text font-mono transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        <p className="text-xs text-muted mb-4">
          Drag instructions to build your image. {builtLayers.length === 0 && (
            <span className="text-secondary">Start with a FROM instruction.</span>
          )}
        </p>

        <div className="flex flex-wrap gap-2">
          {availableInstructions.map(instruction => {
            const Icon = instruction.icon;
            return (
              <div
                key={instruction.id}
                draggable
                onDragStart={() => handleDragStart(instruction)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-grab
                  active:cursor-grabbing transition-all hover:scale-105 ${getColorClasses(instruction.color)}`}
              >
                <GripVertical className="w-3 h-3 opacity-50" />
                <Icon className="w-4 h-4" />
                <span className="text-sm font-mono">{instruction.type}</span>
                <span className="text-xs opacity-60">{instruction.content}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Build Area */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Drop Zone / Layer Stack */}
        <div
          ref={layerStackRef}
          onDragOver={(e) => { e.preventDefault(); setIsDropZoneActive(true); }}
          onDragLeave={() => setIsDropZoneActive(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-4 min-h-[300px] transition-all ${
            isDropZoneActive
              ? 'border-primary bg-primary/10'
              : 'border-muted/30 bg-background/50'
          }`}
        >
          <div className="text-center mb-4">
            <span className="text-primary font-mono text-sm flex items-center justify-center gap-2">
              <Layers className="w-4 h-4" />
              Image Layers
            </span>
          </div>

          {builtLayers.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted/50 text-sm">
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Drop instructions here
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {builtLayers.map((layer, index) => {
                const Icon = layer.instruction.icon;
                const isLast = index === builtLayers.length - 1;

                return (
                  <div
                    key={`${layer.instruction.id}-${index}`}
                    data-layer={index}
                    className={`relative group rounded-lg border p-3 origin-bottom ${getColorClasses(layer.instruction.color)}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-mono text-sm">
                          {layer.instruction.type} {layer.instruction.content}
                        </div>
                        <div className="text-xs opacity-60 font-mono">
                          sha256:{layer.hash}...
                        </div>
                      </div>
                      <div className="text-xs font-mono opacity-60">
                        {layer.instruction.size > 0 ? `+${layer.instruction.size}MB` : '0B'}
                      </div>
                      {isLast && (
                        <button
                          onClick={() => removeLayer(index)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger/20 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-danger" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dockerfile Preview */}
        <div className="bg-terminal rounded-xl border border-muted/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface/50 border-b border-muted/30">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="ml-3 text-xs text-muted font-mono">Dockerfile</span>
          </div>

          <div className="p-4 font-mono text-sm min-h-[260px]">
            {builtLayers.length === 0 ? (
              <div className="text-muted/50 italic"># Your Dockerfile will appear here</div>
            ) : (
              <>
                <div className="text-muted mb-2"># Auto-generated Dockerfile</div>
                {builtLayers.map((layer, index) => (
                  <div
                    key={`dockerfile-${index}`}
                    className={`text-${layer.instruction.color}`}
                  >
                    {layer.instruction.type} {layer.instruction.content}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Size indicator */}
          {builtLayers.length > 0 && (
            <div className="px-4 py-3 border-t border-muted/30 flex justify-between text-xs font-mono">
              <span className="text-muted">Total layers: {builtLayers.length}</span>
              <span className="text-primary">
                Size: ~{builtLayers[builtLayers.length - 1]?.cumulativeSize.toFixed(1)}MB
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div
          ref={successRef}
          className="p-4 bg-primary/10 rounded-lg border border-primary/30 text-center opacity-0"
        >
          <CheckCircle className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-sm text-primary font-mono">Image built successfully!</p>
          <p className="text-xs text-muted mt-1">
            Each instruction created a layer. Layers are stacked bottom-to-top.
          </p>
        </div>
      )}

      {/* Educational Insight */}
      <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
        <p className="text-sm text-muted">
          <span className="text-secondary font-mono font-bold">Why layers?</span> Each layer is a
          snapshot of filesystem changes. When you rebuild, Docker can reuse unchanged layers from
          cache instead of recreating them. This makes builds fast!
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import {
  RefreshCw,
  Zap,
  Clock,
  Edit3,
  Check,
  X,
  ArrowDown,
  RotateCcw
} from 'lucide-react';

interface DockerfileLine {
  id: string;
  instruction: string;
  content: string;
  alternateContent?: string;
  buildTime: number; // seconds
  description: string;
}

const DOCKERFILE_LINES: DockerfileLine[] = [
  {
    id: 'from',
    instruction: 'FROM',
    content: 'python:3.11-slim',
    buildTime: 0.5,
    description: 'Base image - rarely changes',
  },
  {
    id: 'workdir',
    instruction: 'WORKDIR',
    content: '/app',
    buildTime: 0.1,
    description: 'Set working directory',
  },
  {
    id: 'copy-req',
    instruction: 'COPY',
    content: 'requirements.txt .',
    alternateContent: 'requirements.txt /app/',
    buildTime: 0.2,
    description: 'Copy dependency file',
  },
  {
    id: 'run-pip',
    instruction: 'RUN',
    content: 'pip install -r requirements.txt',
    alternateContent: 'pip install --no-cache-dir -r requirements.txt',
    buildTime: 45,
    description: 'Install dependencies (slow!)',
  },
  {
    id: 'copy-app',
    instruction: 'COPY',
    content: '. .',
    alternateContent: 'src/ /app/src/',
    buildTime: 0.5,
    description: 'Copy application code',
  },
  {
    id: 'cmd',
    instruction: 'CMD',
    content: '["python", "app.py"]',
    buildTime: 0.1,
    description: 'Default command',
  },
];

type LayerStatus = 'cached' | 'rebuilding' | 'pending' | 'idle';

interface LayerState {
  id: string;
  status: LayerStatus;
  modified: boolean;
}

export function LayerCaching() {
  const [layerStates, setLayerStates] = useState<LayerState[]>(
    DOCKERFILE_LINES.map(line => ({
      id: line.id,
      status: 'idle',
      modified: false,
    }))
  );
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);
  const [totalBuildTime, setTotalBuildTime] = useState(0);
  const [cachedTime, setCachedTime] = useState(0);

  const layersRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const toggleModified = (id: string) => {
    if (isBuilding) return;

    setLayerStates(prev => prev.map(layer =>
      layer.id === id ? { ...layer, modified: !layer.modified } : layer
    ));
    setBuildComplete(false);
  };

  const simulateBuild = async () => {
    if (isBuilding) return;

    setIsBuilding(true);
    setBuildComplete(false);

    // Find first modified layer
    const firstModifiedIndex = layerStates.findIndex(l => l.modified);

    let totalTime = 0;
    let savedTime = 0;

    // Process each layer
    for (let i = 0; i < DOCKERFILE_LINES.length; i++) {
      const line = DOCKERFILE_LINES[i];
      const isModifiedOrAfter = firstModifiedIndex !== -1 && i >= firstModifiedIndex;

      // Set layer to processing
      setLayerStates(prev => prev.map((layer, idx) =>
        idx === i ? { ...layer, status: isModifiedOrAfter ? 'rebuilding' : 'cached' } : layer
      ));

      // Animate the layer
      const layerEl = layersRef.current?.querySelector(`[data-layer="${line.id}"]`);
      if (layerEl) {
        anime({
          targets: layerEl,
          scale: [1, 1.02, 1],
          duration: 300,
          easing: 'easeOutElastic(1, 0.8)',
        });
      }

      // Simulate build time
      const actualBuildTime = isModifiedOrAfter ? line.buildTime : 0.1;
      await new Promise(resolve => setTimeout(resolve, actualBuildTime * 20)); // Scaled for demo

      if (!isModifiedOrAfter) {
        savedTime += line.buildTime;
      } else {
        totalTime += line.buildTime;
      }
    }

    setTotalBuildTime(totalTime);
    setCachedTime(savedTime);
    setIsBuilding(false);
    setBuildComplete(true);

    // Reset layer statuses to idle after build completes
    setLayerStates(prev => prev.map(layer => ({
      ...layer,
      status: 'idle',
    })));

    // Animate stats
    if (statsRef.current) {
      anime({
        targets: statsRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'easeOutExpo',
      });
    }
  };

  const reset = () => {
    setLayerStates(DOCKERFILE_LINES.map(line => ({
      id: line.id,
      status: 'idle',
      modified: false,
    })));
    setBuildComplete(false);
    setTotalBuildTime(0);
    setCachedTime(0);
  };

  const getStatusColor = (status: LayerStatus) => {
    switch (status) {
      case 'cached': return 'bg-primary/20 border-primary/50';
      case 'rebuilding': return 'bg-danger/20 border-danger/50';
      case 'pending': return 'bg-muted/20 border-muted/50';
      default: return 'bg-surface border-muted/30';
    }
  };

  const getStatusIcon = (status: LayerStatus) => {
    switch (status) {
      case 'cached': return <Zap className="w-4 h-4 text-primary" />;
      case 'rebuilding': return <RefreshCw className="w-4 h-4 text-danger animate-spin" />;
      default: return null;
    }
  };

  const modifiedCount = layerStates.filter(l => l.modified).length;
  const firstModifiedIndex = layerStates.findIndex(l => l.modified);
  const rebuildCount = firstModifiedIndex === -1 ? 0 : DOCKERFILE_LINES.length - firstModifiedIndex;

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl p-6 border border-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-sm text-text">Layer Caching</h4>
          <button
            onClick={reset}
            className="text-xs text-muted hover:text-text font-mono transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <p className="text-xs text-muted mb-6">
          Click any line to mark it as &quot;changed&quot;. Then rebuild to see what happens.
        </p>

        {/* Dockerfile with clickable lines */}
        <div ref={layersRef} className="bg-terminal rounded-lg overflow-hidden mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 border-b border-muted/30">
            <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="ml-2 text-xs text-muted font-mono">Dockerfile</span>
          </div>

          <div className="p-4 space-y-1">
            {DOCKERFILE_LINES.map((line, index) => {
              const state = layerStates[index];
              const isModified = state.modified;
              const willRebuild = firstModifiedIndex !== -1 && index >= firstModifiedIndex;

              return (
                <div
                  key={line.id}
                  data-layer={line.id}
                  onClick={() => toggleModified(line.id)}
                  className={`group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer
                    transition-all border ${getStatusColor(state.status)}
                    ${isModified ? 'ring-2 ring-warning/50' : 'hover:bg-muted/10'}`}
                >
                  {/* Line number */}
                  <span className="text-xs text-muted/50 w-4 text-right font-mono">
                    {index + 1}
                  </span>

                  {/* Instruction */}
                  <span className={`font-mono text-sm ${
                    line.instruction === 'FROM' ? 'text-secondary' :
                    line.instruction === 'RUN' ? 'text-warning' :
                    line.instruction === 'COPY' ? 'text-primary' :
                    'text-muted'
                  }`}>
                    {line.instruction}
                  </span>

                  {/* Content */}
                  <span className="font-mono text-sm text-text flex-1">
                    {isModified && line.alternateContent ? line.alternateContent : line.content}
                  </span>

                  {/* Modified indicator */}
                  {isModified && (
                    <span className="text-xs text-warning font-mono flex items-center gap-1">
                      <Edit3 className="w-3 h-3" />
                      changed
                    </span>
                  )}

                  {/* Status icon */}
                  {state.status !== 'idle' && getStatusIcon(state.status)}

                  {/* Build time */}
                  <span className="text-xs text-muted/50 font-mono w-12 text-right">
                    {line.buildTime}s
                  </span>

                  {/* Hover hint */}
                  <div className="absolute left-full ml-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity
                    text-xs text-muted whitespace-nowrap pointer-events-none z-10 bg-surface px-2 py-1 rounded">
                    {line.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview what will happen */}
        {modifiedCount > 0 && !buildComplete && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-sm text-warning font-mono">
              <span className="font-bold">{modifiedCount} line(s) changed</span>
              {' '}&rarr;{' '}
              <span className="text-danger">{rebuildCount} layer(s) will rebuild</span>
            </p>
            <p className="text-xs text-muted mt-1">
              Docker rebuilds from the first changed layer onwards. Everything after must rebuild!
            </p>
          </div>
        )}

        {/* Build button */}
        <button
          onClick={simulateBuild}
          disabled={isBuilding}
          className={`w-full py-3 rounded-lg font-mono text-sm flex items-center justify-center gap-2
            transition-all ${
              isBuilding
                ? 'bg-muted/20 text-muted cursor-not-allowed'
                : 'bg-primary/20 text-primary hover:bg-primary/30'
            }`}
        >
          {isBuilding ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Building...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Rebuild Image
            </>
          )}
        </button>
      </div>

      {/* Build Results */}
      {buildComplete && (
        <div ref={statsRef} className="grid md:grid-cols-2 gap-4 opacity-0">
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/30 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-mono text-primary">{cachedTime.toFixed(1)}s</p>
            <p className="text-xs text-muted">Saved by caching</p>
          </div>

          <div className="bg-danger/10 rounded-lg p-4 border border-danger/30 text-center">
            <RefreshCw className="w-6 h-6 text-danger mx-auto mb-2" />
            <p className="text-2xl font-mono text-danger">{totalBuildTime.toFixed(1)}s</p>
            <p className="text-xs text-muted">Actual build time</p>
          </div>
        </div>
      )}

      {/* Key insight */}
      <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
        <p className="text-sm text-muted">
          <span className="text-secondary font-mono font-bold">Cache strategy:</span> Put things that
          change rarely at the top (base image, dependencies). Put things that change often at the
          bottom (your code). This maximizes cache hits!
        </p>
      </div>
    </div>
  );
}

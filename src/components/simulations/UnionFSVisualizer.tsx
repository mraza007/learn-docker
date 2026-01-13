'use client';

import { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import {
  FileText,
  Folder,
  Edit3,
  Trash2,
  Copy,
  EyeOff,
  RotateCcw,
  ArrowUp
} from 'lucide-react';

interface LayerFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
}

interface WritableChange {
  id: string;
  name: string;
  type: 'created' | 'modified' | 'whiteout';
  originalLayer?: string;
}

interface Layer {
  id: string;
  name: string;
  instruction: string;
  files: LayerFile[];
  color: string;
}

const LAYERS: Layer[] = [
  {
    id: 'base',
    name: 'Base Image',
    instruction: 'FROM python:3.11',
    color: 'muted',
    files: [
      { id: 'etc-passwd', name: '/etc/passwd', type: 'file' },
      { id: 'etc-hosts', name: '/etc/hosts', type: 'file' },
      { id: 'bin-python', name: '/bin/python', type: 'file' },
    ],
  },
  {
    id: 'deps',
    name: 'Dependencies',
    instruction: 'RUN pip install',
    color: 'warning',
    files: [
      { id: 'pandas-init', name: 'pandas/__init__.py', type: 'file' },
      { id: 'numpy-init', name: 'numpy/__init__.py', type: 'file' },
      { id: 'requests-init', name: 'requests/__init__.py', type: 'file' },
    ],
  },
  {
    id: 'app',
    name: 'App Layer',
    instruction: 'COPY . /app',
    color: 'secondary',
    files: [
      { id: 'main-py', name: 'main.py', type: 'file' },
      { id: 'config-json', name: 'config.json', type: 'file' },
      { id: 'utils-py', name: 'utils.py', type: 'file' },
    ],
  },
];

export function UnionFSVisualizer() {
  const [writableChanges, setWritableChanges] = useState<WritableChange[]>([]);
  const [animatingFile, setAnimatingFile] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: string; file: string } | null>(null);

  const animationRef = useRef<HTMLDivElement>(null);
  const writableRef = useRef<HTMLDivElement>(null);

  // Animate new changes appearing in writable layer
  useEffect(() => {
    if (writableChanges.length > 0 && writableRef.current) {
      const lastChange = writableRef.current.querySelector('[data-new="true"]');
      if (lastChange) {
        anime({
          targets: lastChange,
          scale: [0, 1.1, 1],
          opacity: [0, 1],
          duration: 400,
          easing: 'easeOutElastic(1, 0.8)',
        });
      }
    }
  }, [writableChanges]);

  const runCopyAnimation = (fileName: string, callback: () => void) => {
    setAnimatingFile(fileName);
    setShowAnimation(true);

    // Animate the copy arrow
    if (animationRef.current) {
      anime({
        targets: animationRef.current,
        translateY: [-100, 0],
        opacity: [0, 1, 1, 0],
        duration: 800,
        easing: 'easeOutExpo',
        complete: () => {
          setShowAnimation(false);
          setAnimatingFile(null);
          callback();
        },
      });
    } else {
      callback();
    }
  };

  const handleModifyFile = (file: LayerFile, layerId: string) => {
    // Check if already modified
    if (writableChanges.some(c => c.id === file.id)) return;

    setLastAction({ type: 'modify', file: file.name });

    runCopyAnimation(file.name, () => {
      setWritableChanges(prev => [
        ...prev,
        {
          id: file.id,
          name: file.name,
          type: 'modified',
          originalLayer: layerId,
        },
      ]);
    });
  };

  const handleDeleteFile = (file: LayerFile, layerId: string) => {
    // Check if already has whiteout
    if (writableChanges.some(c => c.id === `wh-${file.id}`)) return;

    setLastAction({ type: 'delete', file: file.name });

    setWritableChanges(prev => [
      ...prev,
      {
        id: `wh-${file.id}`,
        name: `.wh.${file.name}`,
        type: 'whiteout',
        originalLayer: layerId,
      },
    ]);
  };

  const handleCreateFile = () => {
    const newId = `new-${Date.now()}`;
    setLastAction({ type: 'create', file: 'data.log' });

    setWritableChanges(prev => [
      ...prev,
      {
        id: newId,
        name: 'data.log',
        type: 'created',
      },
    ]);
  };

  const reset = () => {
    setWritableChanges([]);
    setLastAction(null);
  };

  const getFileStatus = (fileId: string) => {
    const hasWhiteout = writableChanges.some(c => c.id === `wh-${fileId}`);
    const isModified = writableChanges.some(c => c.id === fileId && c.type === 'modified');
    return { hasWhiteout, isModified };
  };

  const getColorClasses = (color: string, isHeader = false) => {
    if (isHeader) {
      switch (color) {
        case 'primary': return 'text-primary';
        case 'secondary': return 'text-secondary';
        case 'warning': return 'text-warning';
        default: return 'text-muted';
      }
    }
    switch (color) {
      case 'primary': return 'bg-primary/10 border-primary/30';
      case 'secondary': return 'bg-secondary/10 border-secondary/30';
      case 'warning': return 'bg-warning/10 border-warning/30';
      default: return 'bg-muted/10 border-muted/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Layer Stack */}
      <div className="bg-surface rounded-xl p-6 border border-muted/30 relative">
        {/* Copy animation overlay */}
        {showAnimation && (
          <div
            ref={animationRef}
            className="absolute left-1/2 top-20 -translate-x-1/2 z-10 flex flex-col items-center opacity-0"
          >
            <div className="bg-primary text-background px-3 py-1 rounded-lg font-mono text-xs flex items-center gap-2">
              <Copy className="w-3 h-3" />
              Copying {animatingFile}
            </div>
            <ArrowUp className="w-6 h-6 text-primary mt-1" />
          </div>
        )}

        <div className="space-y-3">
          {/* Writable Layer */}
          <div
            ref={writableRef}
            className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-primary font-bold">Writable Layer</span>
                <span className="text-xs text-muted">(Container changes)</span>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">
                Read-Write
              </span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {writableChanges.length === 0 ? (
                <span className="text-xs text-muted/50 italic">
                  Changes will appear here...
                </span>
              ) : (
                writableChanges.map((change, index) => (
                  <div
                    key={change.id}
                    data-new={index === writableChanges.length - 1 ? 'true' : 'false'}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-mono ${
                      change.type === 'whiteout'
                        ? 'bg-danger/20 text-danger border border-danger/30'
                        : change.type === 'modified'
                        ? 'bg-secondary/20 text-secondary border border-secondary/30'
                        : 'bg-primary/20 text-primary border border-primary/30'
                    }`}
                  >
                    {change.type === 'whiteout' ? (
                      <EyeOff className="w-3 h-3" />
                    ) : change.type === 'modified' ? (
                      <Edit3 className="w-3 h-3" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    {change.name}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Read-only Layers */}
          {[...LAYERS].reverse().map((layer) => (
            <div
              key={layer.id}
              className={`rounded-lg border p-4 ${getColorClasses(layer.color)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm ${getColorClasses(layer.color, true)}`}>
                    {layer.name}
                  </span>
                  <span className="text-xs text-muted">({layer.instruction})</span>
                </div>
                <span className="text-xs bg-muted/20 text-muted px-2 py-0.5 rounded font-mono">
                  Read-Only
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {layer.files.map((file) => {
                  const { hasWhiteout, isModified } = getFileStatus(file.id);

                  return (
                    <div
                      key={file.id}
                      className={`group relative flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-mono
                        transition-all ${
                          hasWhiteout
                            ? 'bg-danger/10 text-danger/50 line-through'
                            : isModified
                            ? 'bg-muted/20 text-muted/50'
                            : 'bg-background text-text hover:bg-muted/20'
                        }`}
                    >
                      {file.type === 'folder' ? (
                        <Folder className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      {file.name}

                      {/* Action buttons on hover (only for non-affected files) */}
                      {!hasWhiteout && !isModified && file.type === 'file' && (
                        <div className="absolute -right-1 -top-1 hidden group-hover:flex gap-1">
                          <button
                            onClick={() => handleModifyFile(file, layer.id)}
                            className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center
                              hover:bg-secondary/80 transition-colors"
                            title="Modify file"
                          >
                            <Edit3 className="w-2.5 h-2.5 text-background" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file, layer.id)}
                            className="w-5 h-5 bg-danger rounded-full flex items-center justify-center
                              hover:bg-danger/80 transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-background" />
                          </button>
                        </div>
                      )}

                      {hasWhiteout && (
                        <span className="ml-1 text-[10px] text-danger">(hidden)</span>
                      )}
                      {isModified && (
                        <span className="ml-1 text-[10px] text-muted">(shadowed)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleCreateFile}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg
            font-mono text-sm hover:bg-primary/30 transition-colors border border-primary/30"
        >
          <FileText className="w-4 h-4" />
          Create New File
        </button>
        <span className="text-xs text-muted self-center">or hover files above to modify/delete</span>
        {writableChanges.length > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 text-muted rounded-lg
              font-mono text-sm hover:text-text transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Dynamic Insight */}
      {lastAction && (
        <div className={`p-4 rounded-lg border text-center ${
          lastAction.type === 'delete'
            ? 'bg-danger/10 border-danger/30'
            : lastAction.type === 'modify'
            ? 'bg-secondary/10 border-secondary/30'
            : 'bg-primary/10 border-primary/30'
        }`}>
          <p className="text-sm text-muted">
            {lastAction.type === 'create' && (
              <>
                <span className="text-primary font-mono font-bold">New file created </span>
                directly in the writable layer. Lower layers are untouched.
              </>
            )}
            {lastAction.type === 'modify' && (
              <>
                <span className="text-secondary font-mono font-bold">Copy-on-Write: </span>
                The original <code className="text-text">{lastAction.file}</code> stays in its layer.
                A modified copy now exists in the writable layer, which "shadows" the original.
              </>
            )}
            {lastAction.type === 'delete' && (
              <>
                <span className="text-danger font-mono font-bold">Whiteout marker created: </span>
                The original <code className="text-text">{lastAction.file}</code> still exists in its layer!
                Docker just added <code className="text-danger">.wh.{lastAction.file}</code> to hide it.
              </>
            )}
          </p>
        </div>
      )}

      {/* Summary insight */}
      <div className="p-4 bg-muted/10 rounded-lg border border-muted/30">
        <p className="text-sm text-muted">
          <span className="text-text font-mono font-bold">Why this matters: </span>
          Read-only layers are never modified, so they can be shared between containers and images.
          Only the thin writable layer is unique to each container—saving massive amounts of disk space.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import {
  Layers,
  HardDrive,
  Share2,
  Check,
  ChevronRight
} from 'lucide-react';

interface ImageLayer {
  id: string;
  name: string;
  size: number; // MB
  hash: string;
  color: string;
}

interface DockerImage {
  id: string;
  name: string;
  layers: ImageLayer[];
}

// Shared base layers
const SHARED_LAYERS: ImageLayer[] = [
  { id: 'alpine-base', name: 'Alpine Linux base', size: 5, hash: 'a24bb', color: 'secondary' },
  { id: 'alpine-libs', name: 'Core libraries', size: 3, hash: 'b35cc', color: 'secondary' },
];

const PYTHON_LAYERS: ImageLayer[] = [
  { id: 'python-runtime', name: 'Python 3.11', size: 45, hash: 'c46dd', color: 'warning' },
  { id: 'python-pip', name: 'pip packages', size: 80, hash: 'd57ee', color: 'warning' },
];

const NODE_LAYERS: ImageLayer[] = [
  { id: 'node-runtime', name: 'Node.js 20', size: 35, hash: 'e68ff', color: 'primary' },
  { id: 'node-npm', name: 'npm packages', size: 60, hash: 'f79gg', color: 'primary' },
];

const IMAGES: DockerImage[] = [
  {
    id: 'python-app',
    name: 'my-python-app',
    layers: [
      ...SHARED_LAYERS,
      ...PYTHON_LAYERS,
      { id: 'python-app-code', name: 'Application code', size: 5, hash: 'g8ahh', color: 'danger' },
    ],
  },
  {
    id: 'node-app',
    name: 'my-node-app',
    layers: [
      ...SHARED_LAYERS,
      ...NODE_LAYERS,
      { id: 'node-app-code', name: 'Application code', size: 8, hash: 'h9bii', color: 'danger' },
    ],
  },
  {
    id: 'python-api',
    name: 'my-python-api',
    layers: [
      ...SHARED_LAYERS,
      ...PYTHON_LAYERS,
      { id: 'api-code', name: 'API code', size: 3, hash: 'i0cjj', color: 'danger' },
    ],
  },
];

export function LayerSharingVisualizer() {
  const [selectedImages, setSelectedImages] = useState<string[]>(['python-app']);
  const [showConnections, setShowConnections] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Animate on selection change
  useEffect(() => {
    if (selectedImages.length > 1) {
      setShowConnections(true);

      // Animate connection lines
      setTimeout(() => {
        if (svgRef.current) {
          const paths = svgRef.current.querySelectorAll('path');
          anime({
            targets: paths,
            strokeDashoffset: [anime.setDashoffset, 0],
            duration: 800,
            easing: 'easeInOutSine',
            delay: anime.stagger(100),
          });
        }
      }, 100);
    } else {
      setShowConnections(false);
    }
  }, [selectedImages]);

  const toggleImage = (id: string) => {
    setSelectedImages(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  const getSelectedImagesData = () => {
    return IMAGES.filter(img => selectedImages.includes(img.id));
  };

  // Find shared layers between selected images
  const getSharedLayers = () => {
    const selected = getSelectedImagesData();
    if (selected.length < 2) return [];

    const firstImageLayerIds = new Set(selected[0].layers.map(l => l.id));

    return selected[0].layers.filter(layer => {
      return selected.every(img => img.layers.some(l => l.id === layer.id));
    });
  };

  // Calculate storage
  const calculateStorage = () => {
    const selected = getSelectedImagesData();
    if (selected.length === 0) return { actual: 0, naive: 0, saved: 0 };

    // Naive: sum of all layers in all images
    const naive = selected.reduce((sum, img) =>
      sum + img.layers.reduce((s, l) => s + l.size, 0), 0
    );

    // Actual: unique layers only
    const uniqueLayers = new Set<string>();
    let actual = 0;
    selected.forEach(img => {
      img.layers.forEach(layer => {
        if (!uniqueLayers.has(layer.id)) {
          uniqueLayers.add(layer.id);
          actual += layer.size;
        }
      });
    });

    return { actual, naive, saved: naive - actual };
  };

  const storage = calculateStorage();
  const sharedLayers = getSharedLayers();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'secondary': return 'bg-secondary/20 border-secondary/50 text-secondary';
      case 'warning': return 'bg-warning/20 border-warning/50 text-warning';
      case 'primary': return 'bg-primary/20 border-primary/50 text-primary';
      case 'danger': return 'bg-danger/20 border-danger/50 text-danger';
      default: return 'bg-muted/20 border-muted/50 text-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl p-6 border border-muted/30">
        <h4 className="font-mono text-sm text-text mb-4">Layer Sharing</h4>

        <p className="text-xs text-muted mb-6">
          Select multiple images to see how they share layers.
        </p>

        {/* Image Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {IMAGES.map(image => {
            const isSelected = selectedImages.includes(image.id);
            const totalSize = image.layers.reduce((s, l) => s + l.size, 0);

            return (
              <button
                key={image.id}
                onClick={() => toggleImage(image.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm
                  transition-all ${
                    isSelected
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-background border-muted/30 text-muted hover:border-primary/30'
                  }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
                <span>{image.name}</span>
                <span className="text-xs opacity-60">{totalSize}MB</span>
              </button>
            );
          })}
        </div>

        {/* Layer Visualization */}
        <div ref={containerRef} className="relative">
          <div className={`grid gap-6 ${
            selectedImages.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
            selectedImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {getSelectedImagesData().map((image, imgIndex) => (
              <div key={image.id} className="relative">
                <div className="text-center mb-3">
                  <span className="text-xs font-mono text-muted">{image.name}</span>
                </div>

                <div className="space-y-1">
                  {image.layers.map((layer, layerIndex) => {
                    const isShared = sharedLayers.some(s => s.id === layer.id);

                    return (
                      <div
                        key={`${image.id}-${layer.id}`}
                        data-layer={layer.id}
                        data-image={image.id}
                        className={`relative rounded-lg border p-2 transition-all ${getColorClasses(layer.color)}
                          ${isShared && selectedImages.length > 1 ? 'ring-2 ring-primary/50' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono truncate">{layer.name}</span>
                          <span className="text-[10px] opacity-60 whitespace-nowrap">{layer.size}MB</span>
                        </div>

                        {/* Hash */}
                        <div className="text-[10px] opacity-40 font-mono">
                          sha256:{layer.hash}...
                        </div>

                        {/* Shared indicator */}
                        {isShared && selectedImages.length > 1 && (
                          <div className="absolute -right-1 -top-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Share2 className="w-2.5 h-2.5 text-background" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Connection lines for shared layers */}
          {showConnections && selectedImages.length > 1 && (
            <div className="absolute inset-0 pointer-events-none">
              <svg
                ref={svgRef}
                className="w-full h-full"
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                {/* Visual connection lines would be drawn here in a real implementation */}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Storage Stats */}
      {selectedImages.length > 1 && (
        <div className="bg-primary/10 rounded-xl p-6 border border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5 text-primary" />
            <h4 className="font-mono text-sm text-text">Storage Analysis</h4>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-mono text-muted line-through">{storage.naive}MB</p>
              <p className="text-xs text-muted">Without sharing</p>
            </div>

            <div>
              <p className="text-2xl font-mono text-primary">{storage.actual}MB</p>
              <p className="text-xs text-muted">Actual storage</p>
            </div>

            <div>
              <p className="text-2xl font-mono text-primary">{storage.saved}MB</p>
              <p className="text-xs text-primary">Saved!</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-sm text-center text-muted">
              <span className="text-primary font-bold">{sharedLayers.length} layers</span> are shared
              between {selectedImages.length} images, saving{' '}
              <span className="text-primary font-bold">
                {Math.round((storage.saved / storage.naive) * 100)}%
              </span> storage
            </p>
          </div>
        </div>
      )}

      {/* Shared layers list */}
      {sharedLayers.length > 0 && selectedImages.length > 1 && (
        <div className="bg-surface rounded-xl p-4 border border-muted/30">
          <h5 className="font-mono text-xs text-muted mb-3">Shared Layers:</h5>
          <div className="flex flex-wrap gap-2">
            {sharedLayers.map(layer => (
              <div
                key={layer.id}
                className={`text-xs font-mono px-2 py-1 rounded border ${getColorClasses(layer.color)}`}
              >
                {layer.name} ({layer.size}MB)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key insight */}
      <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
        <p className="text-sm text-muted">
          <span className="text-secondary font-mono font-bold">Why this matters:</span> When you
          pull a new image, Docker only downloads layers you don&apos;t have. If you already have
          the base layers from another image, the pull is almost instant!
        </p>
      </div>
    </div>
  );
}

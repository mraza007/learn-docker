'use client';

import { useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { GripVertical, Package, Code, Settings, Database } from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  size: string;
  instruction: string;
  icon: React.ReactNode;
  color: string;
}

const initialLayers: Layer[] = [
  {
    id: 'base',
    name: 'Base Image',
    size: '~50MB',
    instruction: 'FROM python:3.11-slim',
    icon: <Database className="w-4 h-4" />,
    color: 'text-secondary',
  },
  {
    id: 'deps',
    name: 'Dependencies',
    size: '~120MB',
    instruction: 'RUN pip install pandas numpy',
    icon: <Package className="w-4 h-4" />,
    color: 'text-warning',
  },
  {
    id: 'code',
    name: 'Application Code',
    size: '~5MB',
    instruction: 'COPY . /app',
    icon: <Code className="w-4 h-4" />,
    color: 'text-primary',
  },
  {
    id: 'config',
    name: 'Configuration',
    size: '~1KB',
    instruction: 'CMD ["python", "app.py"]',
    icon: <Settings className="w-4 h-4" />,
    color: 'text-muted',
  },
];

const optimalOrder = ['base', 'deps', 'code', 'config'];

export function ImageLayerBuilder() {
  const [layers, setLayers] = useState(initialLayers);
  const [showHint, setShowHint] = useState(false);

  const isOptimalOrder = layers.map(l => l.id).join(',') === optimalOrder.join(',');

  const totalSize = layers.reduce((acc, layer) => {
    const num = parseFloat(layer.size.replace(/[^0-9.]/g, ''));
    const unit = layer.size.includes('MB') ? 1 : 0.001;
    return acc + num * unit;
  }, 0);

  return (
    <div className="bg-surface rounded-xl p-6 border border-muted/30">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-mono text-lg text-text mb-1">Build Your Image</h4>
          <p className="text-sm text-muted">
            Drag layers to reorder. Each layer builds on the previous.
          </p>
        </div>
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-xs text-secondary hover:text-secondary/80 font-mono"
        >
          {showHint ? 'Hide hint' : 'Need a hint?'}
        </button>
      </div>

      {showHint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 bg-secondary/10 border border-secondary/30 rounded-lg text-sm text-secondary"
        >
          💡 Put things that change <strong>least often</strong> at the bottom.
          Docker caches unchanged layers!
        </motion.div>
      )}

      {/* Dockerfile preview */}
      <div className="mb-6 bg-terminal rounded-lg p-4 font-mono text-sm">
        <div className="text-muted mb-2"># Dockerfile</div>
        {layers.map((layer, index) => (
          <motion.div
            key={layer.id}
            layout
            className={layer.color}
          >
            {layer.instruction}
          </motion.div>
        ))}
      </div>

      {/* Draggable layers */}
      <Reorder.Group
        axis="y"
        values={layers}
        onReorder={setLayers}
        className="space-y-2"
      >
        {layers.map((layer, index) => (
          <Reorder.Item
            key={layer.id}
            value={layer}
            className="cursor-grab active:cursor-grabbing"
          >
            <motion.div
              layout
              className={`flex items-center gap-3 p-3 bg-background rounded-lg border border-muted/30
                hover:border-secondary/50 transition-colors`}
              whileHover={{ scale: 1.01 }}
              whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
            >
              <GripVertical className="w-4 h-4 text-muted" />

              <div className={`flex-shrink-0 ${layer.color}`}>
                {layer.icon}
              </div>

              <div className="flex-1">
                <div className="font-mono text-sm text-text">{layer.name}</div>
                <div className="text-xs text-muted">{layer.instruction}</div>
              </div>

              <div className="text-xs font-mono text-muted">
                {layer.size}
              </div>

              {/* Layer number indicator */}
              <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs font-mono text-muted">
                {index + 1}
              </div>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Stats */}
      <div className="mt-6 flex justify-between items-center pt-4 border-t border-muted/30">
        <div className="text-sm">
          <span className="text-muted">Total size: </span>
          <span className="font-mono text-text">{totalSize.toFixed(1)}MB</span>
        </div>

        {isOptimalOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-primary text-sm font-mono"
          >
            <span>✓</span>
            Optimal layer order!
          </motion.div>
        )}
      </div>

      {/* Caching explanation */}
      <motion.div
        className="mt-4 p-4 bg-background rounded-lg"
        animate={{
          borderColor: isOptimalOrder ? 'rgba(0, 255, 159, 0.3)' : 'rgba(107, 107, 107, 0.3)',
        }}
        style={{ border: '1px solid' }}
      >
        <div className="text-sm text-muted">
          <strong className="text-text">Layer Caching:</strong> When you rebuild, Docker
          reuses unchanged layers from cache. If you change your code but not dependencies,
          only the code layer rebuilds. That&apos;s why order matters!
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Server, Box, Layers, Cpu, ArrowDown } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  description: string;
  color: string;
}

const components: Component[] = [
  { id: 'cli', name: 'Docker CLI', description: 'Command-line interface. Talks to daemon via REST API.', color: 'primary' },
  { id: 'daemon', name: 'Docker Daemon (dockerd)', description: 'Background service that manages containers, images, networks.', color: 'secondary' },
  { id: 'containerd', name: 'containerd', description: 'Industry-standard container runtime. Manages container lifecycle.', color: 'warning' },
  { id: 'runc', name: 'runc', description: 'Low-level runtime that creates containers using Linux primitives.', color: 'danger' },
  { id: 'kernel', name: 'Linux Kernel', description: 'Provides namespaces, cgroups, and other primitives.', color: 'muted' },
];

export function ArchitectureDiagram() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const active = components.find(c => c.id === activeComponent);

  return (
    <div className="bg-surface rounded-xl p-6 border border-muted/30">
      {/* Architecture stack */}
      <div className="max-w-md mx-auto space-y-3">
        {/* CLI */}
        <motion.div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            activeComponent === 'cli'
              ? 'bg-primary/20 border-primary'
              : 'bg-background border-muted/30 hover:border-primary/50'
          }`}
          onClick={() => setActiveComponent('cli')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-primary" />
            <div>
              <div className="font-mono text-text">Docker CLI</div>
              <div className="text-xs text-muted">docker run, docker build, ...</div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-muted" />
        </div>

        {/* Daemon */}
        <motion.div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            activeComponent === 'daemon'
              ? 'bg-secondary/20 border-secondary'
              : 'bg-background border-muted/30 hover:border-secondary/50'
          }`}
          onClick={() => setActiveComponent('daemon')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-secondary" />
            <div>
              <div className="font-mono text-text">dockerd</div>
              <div className="text-xs text-muted">Docker Daemon (REST API on /var/run/docker.sock)</div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-muted" />
        </div>

        {/* containerd */}
        <motion.div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            activeComponent === 'containerd'
              ? 'bg-warning/20 border-warning'
              : 'bg-background border-muted/30 hover:border-warning/50'
          }`}
          onClick={() => setActiveComponent('containerd')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-warning" />
            <div>
              <div className="font-mono text-text">containerd</div>
              <div className="text-xs text-muted">Container runtime (image pull, storage, networking)</div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-muted" />
        </div>

        {/* runc */}
        <motion.div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            activeComponent === 'runc'
              ? 'bg-danger/20 border-danger'
              : 'bg-background border-muted/30 hover:border-danger/50'
          }`}
          onClick={() => setActiveComponent('runc')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Box className="w-6 h-6 text-danger" />
            <div>
              <div className="font-mono text-text">runc</div>
              <div className="text-xs text-muted">OCI runtime (spawns container processes)</div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-muted" />
        </div>

        {/* Kernel */}
        <motion.div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            activeComponent === 'kernel'
              ? 'bg-muted/30 border-muted'
              : 'bg-background border-muted/30 hover:border-muted/50'
          }`}
          onClick={() => setActiveComponent('kernel')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-muted" />
            <div>
              <div className="font-mono text-text">Linux Kernel</div>
              <div className="text-xs text-muted">namespaces, cgroups, seccomp, capabilities</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Description panel */}
      <motion.div
        className="mt-6 bg-terminal rounded-lg p-4 min-h-[80px]"
        animate={{ borderColor: active ?
          active.color === 'primary' ? 'rgba(0, 255, 159, 0.5)' :
          active.color === 'secondary' ? 'rgba(0, 212, 255, 0.5)' :
          active.color === 'warning' ? 'rgba(255, 184, 0, 0.5)' :
          active.color === 'danger' ? 'rgba(255, 71, 87, 0.5)' :
          'rgba(107, 107, 107, 0.5)' : 'transparent'
        }}
        style={{ border: '2px solid transparent' }}
      >
        {active ? (
          <div>
            <div className={`font-mono text-sm mb-2 ${
              active.color === 'primary' ? 'text-primary' :
              active.color === 'secondary' ? 'text-secondary' :
              active.color === 'warning' ? 'text-warning' :
              active.color === 'danger' ? 'text-danger' :
              'text-muted'
            }`}>
              {active.name}
            </div>
            <p className="text-sm text-muted">{active.description}</p>
          </div>
        ) : (
          <p className="text-sm text-muted text-center">Click a component to learn more</p>
        )}
      </motion.div>
    </div>
  );
}

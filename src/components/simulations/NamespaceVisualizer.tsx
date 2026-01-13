'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Network, HardDrive, User, Globe, Server } from 'lucide-react';

type NamespaceType = 'pid' | 'net' | 'mnt' | 'user';

interface Namespace {
  id: NamespaceType;
  name: string;
  description: string;
  icon: React.ReactNode;
  hostView: string[];
  containerView: string[];
}

const namespaces: Namespace[] = [
  {
    id: 'pid',
    name: 'PID',
    description: 'Process isolation - container sees only its own processes',
    icon: <Eye className="w-5 h-5" />,
    hostView: ['PID 1: systemd', 'PID 245: dockerd', 'PID 1842: nginx', 'PID 1843: node app.js', 'PID 2104: postgres', 'PID 2891: redis-server'],
    containerView: ['PID 1: node app.js'],
  },
  {
    id: 'net',
    name: 'Network',
    description: 'Network isolation - container gets its own network stack',
    icon: <Network className="w-5 h-5" />,
    hostView: ['eth0: 192.168.1.100', 'docker0: 172.17.0.1', 'lo: 127.0.0.1'],
    containerView: ['eth0: 172.17.0.2', 'lo: 127.0.0.1'],
  },
  {
    id: 'mnt',
    name: 'Mount',
    description: 'Filesystem isolation - container has its own root filesystem',
    icon: <HardDrive className="w-5 h-5" />,
    hostView: ['/', '/home', '/var', '/etc', '/usr', '/opt/myapp'],
    containerView: ['/', '/app', '/node_modules', '/tmp'],
  },
  {
    id: 'user',
    name: 'User',
    description: 'User isolation - root in container ≠ root on host',
    icon: <User className="w-5 h-5" />,
    hostView: ['root (uid 0)', 'hackerman (uid 1000)', 'docker (uid 999)'],
    containerView: ['root (uid 0)', '→ maps to uid 100000'],
  },
];

export function NamespaceVisualizer() {
  const [selectedNamespace, setSelectedNamespace] = useState<NamespaceType>('pid');
  const [showContainerView, setShowContainerView] = useState(false);

  const current = namespaces.find(n => n.id === selectedNamespace)!;

  return (
    <div className="bg-surface rounded-xl p-6 border border-muted/30">
      {/* Namespace tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {namespaces.map((ns) => (
          <button
            key={ns.id}
            onClick={() => setSelectedNamespace(ns.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
              selectedNamespace === ns.id
                ? 'bg-primary/20 text-primary border border-primary/50'
                : 'bg-background text-muted hover:text-text border border-transparent'
            }`}
          >
            {ns.icon}
            {ns.name}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-muted mb-6">{current.description}</p>

      {/* View toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-background rounded-lg p-1">
          <button
            onClick={() => setShowContainerView(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-colors ${
              !showContainerView
                ? 'bg-secondary/20 text-secondary'
                : 'text-muted hover:text-text'
            }`}
          >
            <Globe className="w-4 h-4" />
            Host View
          </button>
          <button
            onClick={() => setShowContainerView(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-colors ${
              showContainerView
                ? 'bg-primary/20 text-primary'
                : 'text-muted hover:text-text'
            }`}
          >
            <Server className="w-4 h-4" />
            Container View
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Host */}
        <div className={`transition-opacity ${showContainerView ? 'opacity-40' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-secondary" />
            <span className="font-mono text-sm text-secondary">Host System</span>
          </div>
          <div className="bg-terminal rounded-lg p-4 min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`host-${selectedNamespace}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {current.hostView.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="font-mono text-sm text-text"
                  >
                    {item}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Container */}
        <div className={`transition-opacity ${!showContainerView ? 'opacity-40' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-primary">Container View</span>
          </div>
          <div className="bg-terminal rounded-lg p-4 min-h-[200px] border border-primary/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={`container-${selectedNamespace}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {current.containerView.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="font-mono text-sm text-primary"
                  >
                    {item}
                  </motion.div>
                ))}
                {showContainerView && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 pt-4 border-t border-muted/30 text-xs text-muted"
                  >
                    {selectedNamespace === 'pid' && '↑ Container only sees its own process as PID 1'}
                    {selectedNamespace === 'net' && '↑ Container has isolated network with its own IP'}
                    {selectedNamespace === 'mnt' && '↑ Container sees only its own filesystem'}
                    {selectedNamespace === 'user' && '↑ Root in container is unprivileged on host'}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

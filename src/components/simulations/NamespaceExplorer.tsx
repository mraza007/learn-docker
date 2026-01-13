'use client';

import { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import {
  Eye,
  Network,
  HardDrive,
  User,
  Globe,
  Box,
  Play
} from 'lucide-react';

type NamespaceType = 'pid' | 'net' | 'mnt' | 'user';

interface Command {
  cmd: string;
  hostOutput: string[];
  containerOutput: string[];
  insight: string;
}

interface NamespaceData {
  id: NamespaceType;
  name: string;
  icon: React.ElementType;
  description: string;
  commands: Command[];
}

const NAMESPACE_DATA: NamespaceData[] = [
  {
    id: 'pid',
    name: 'PID',
    icon: Eye,
    description: 'Process isolation - container sees only its own processes',
    commands: [
      {
        cmd: 'ps aux',
        hostOutput: [
          'USER       PID  COMMAND',
          'root         1  /sbin/init',
          'root       245  dockerd',
          'root      1842  nginx',
          'node      1843  node app.js',
          'postgres  2104  postgres',
        ],
        containerOutput: [
          'USER       PID  COMMAND',
          'node         1  node app.js',
        ],
        insight: 'Host sees all processes. Container only sees itself as PID 1.',
      },
      {
        cmd: 'echo $$',
        hostOutput: ['1843'],
        containerOutput: ['1'],
        insight: 'Container thinks it\'s PID 1 - the init process!',
      },
      {
        cmd: 'kill 1842',
        hostOutput: ['Process 1842 terminated'],
        containerOutput: ['kill: No such process'],
        insight: 'Container can\'t see or kill host processes.',
      },
    ],
  },
  {
    id: 'net',
    name: 'Network',
    icon: Network,
    description: 'Network isolation - container gets its own network stack',
    commands: [
      {
        cmd: 'ip addr',
        hostOutput: [
          'eth0: 192.168.1.100/24',
          'docker0: 172.17.0.1/16',
          'lo: 127.0.0.1/8',
        ],
        containerOutput: [
          'eth0: 172.17.0.2/16',
          'lo: 127.0.0.1/8',
        ],
        insight: 'Container has its own isolated network with a different IP.',
      },
      {
        cmd: 'curl localhost:80',
        hostOutput: ['Welcome to nginx!'],
        containerOutput: ['Connection refused'],
        insight: 'Container\'s localhost is different from host\'s localhost.',
      },
      {
        cmd: 'hostname -I',
        hostOutput: ['192.168.1.100 172.17.0.1'],
        containerOutput: ['172.17.0.2'],
        insight: 'Container only sees its virtual network IP.',
      },
    ],
  },
  {
    id: 'mnt',
    name: 'Mount',
    icon: HardDrive,
    description: 'Filesystem isolation - container has its own root filesystem',
    commands: [
      {
        cmd: 'ls /',
        hostOutput: ['bin  etc  home  lib  opt  root  usr  var'],
        containerOutput: ['app  bin  lib  node_modules  tmp'],
        insight: 'Container has a completely different root filesystem.',
      },
      {
        cmd: 'cat /etc/hostname',
        hostOutput: ['my-server'],
        containerOutput: ['a1b2c3d4e5f6'],
        insight: 'Container has its own hostname (usually the container ID).',
      },
      {
        cmd: 'pwd',
        hostOutput: ['/home/user'],
        containerOutput: ['/app'],
        insight: 'Container\'s working directory is isolated from host.',
      },
    ],
  },
  {
    id: 'user',
    name: 'User',
    icon: User,
    description: 'User isolation - root in container ≠ root on host',
    commands: [
      {
        cmd: 'whoami',
        hostOutput: ['hackerman'],
        containerOutput: ['root'],
        insight: 'You\'re "root" in the container but not on the host!',
      },
      {
        cmd: 'id',
        hostOutput: ['uid=1000(hackerman) gid=1000(hackerman)'],
        containerOutput: ['uid=0(root) gid=0(root)'],
        insight: 'Container root maps to an unprivileged user on host.',
      },
      {
        cmd: 'touch /etc/test',
        hostOutput: ['Permission denied'],
        containerOutput: ['(file created)'],
        insight: 'Container "root" can write to container filesystem only.',
      },
    ],
  },
];

export function NamespaceExplorer() {
  const [activeNamespace, setActiveNamespace] = useState<NamespaceType>('pid');
  const [containerLaunched, setContainerLaunched] = useState(false);
  const [activeCommand, setActiveCommand] = useState<number | null>(null);
  const [terminalOutputs, setTerminalOutputs] = useState<{
    host: string[];
    container: string[];
  }>({ host: [], container: [] });

  const insightRef = useRef<HTMLDivElement>(null);

  const currentData = NAMESPACE_DATA.find(n => n.id === activeNamespace)!;

  // Launch container
  const launchContainer = () => {
    setContainerLaunched(true);
    setTerminalOutputs({ host: [], container: [] });
    setActiveCommand(null);
  };

  // Reset when namespace changes
  useEffect(() => {
    setContainerLaunched(false);
    setTerminalOutputs({ host: [], container: [] });
    setActiveCommand(null);
  }, [activeNamespace]);

  // Animate insight
  useEffect(() => {
    if (activeCommand !== null && insightRef.current) {
      anime({
        targets: insightRef.current,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400,
        easing: 'easeOutExpo',
      });
    }
  }, [activeCommand]);

  // Run command
  const runCommand = (index: number) => {
    const cmd = currentData.commands[index];
    setActiveCommand(index);
    setTerminalOutputs({ host: [], container: [] });

    // Type out outputs with delay
    cmd.hostOutput.forEach((line, i) => {
      setTimeout(() => {
        setTerminalOutputs(prev => ({
          ...prev,
          host: [...prev.host, line],
        }));
      }, i * 80);
    });

    cmd.containerOutput.forEach((line, i) => {
      setTimeout(() => {
        setTerminalOutputs(prev => ({
          ...prev,
          container: [...prev.container, line],
        }));
      }, i * 80);
    });
  };

  return (
    <div className="space-y-6">
      {/* Namespace Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {NAMESPACE_DATA.map((ns) => {
          const Icon = ns.icon;
          const isActive = activeNamespace === ns.id;

          return (
            <button
              key={ns.id}
              onClick={() => setActiveNamespace(ns.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
                isActive
                  ? 'bg-primary/20 border-primary/50 text-primary'
                  : 'bg-surface border-muted/30 text-muted hover:border-primary/30 hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {ns.name}
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted">{currentData.description}</p>

      {/* Launch Container Button */}
      {!containerLaunched && (
        <div className="text-center">
          <button
            onClick={launchContainer}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 text-primary rounded-lg
              font-mono text-sm hover:bg-primary/30 transition-colors border border-primary/30"
          >
            <Play className="w-4 h-4" />
            Launch Container
          </button>
        </div>
      )}

      {/* Dual Terminal */}
      {containerLaunched && (
        <div className="space-y-4">
          {/* Command buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-muted self-center mr-2">Run:</span>
            {currentData.commands.map((cmd, index) => (
              <button
                key={cmd.cmd}
                onClick={() => runCommand(index)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
                  activeCommand === index
                    ? 'bg-secondary/20 border-secondary/50 text-secondary'
                    : 'bg-surface border-muted/30 text-muted hover:text-text hover:border-secondary/30'
                }`}
              >
                $ {cmd.cmd}
              </button>
            ))}
          </div>

          {/* Terminals */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Host Terminal */}
            <div className="bg-terminal rounded-xl border border-muted/30 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 border-b border-muted/30">
                <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="ml-2 text-xs text-muted font-mono flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  host
                </span>
              </div>
              <div className="p-4 min-h-[160px] font-mono text-sm">
                {activeCommand !== null && (
                  <div className="text-secondary mb-2">
                    $ {currentData.commands[activeCommand].cmd}
                  </div>
                )}
                {terminalOutputs.host.map((line, i) => (
                  <div key={i} className="text-text">{line}</div>
                ))}
                {activeCommand === null && (
                  <div className="text-muted/50">Click a command above...</div>
                )}
              </div>
            </div>

            {/* Container Terminal */}
            <div className="bg-terminal rounded-xl border border-primary/30 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 border-b border-primary/30">
                <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="ml-2 text-xs text-primary font-mono flex items-center gap-1">
                  <Box className="w-3 h-3" />
                  container
                </span>
              </div>
              <div className="p-4 min-h-[160px] font-mono text-sm">
                {activeCommand !== null && (
                  <div className="text-secondary mb-2">
                    $ {currentData.commands[activeCommand].cmd}
                  </div>
                )}
                {terminalOutputs.container.map((line, i) => (
                  <div key={i} className="text-primary">{line}</div>
                ))}
                {activeCommand === null && (
                  <div className="text-muted/50">Click a command above...</div>
                )}
              </div>
            </div>
          </div>

          {/* Insight */}
          {activeCommand !== null && (
            <div
              ref={insightRef}
              className="p-4 bg-secondary/10 rounded-lg border border-secondary/30 text-center opacity-0"
            >
              <p className="text-sm text-muted">
                <span className="text-secondary font-mono font-bold">Same command, different result: </span>
                {currentData.commands[activeCommand].insight}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Key insight */}
      <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
        <p className="text-sm text-muted">
          <span className="text-primary font-mono font-bold">The illusion:</span> The container
          process runs on the host, but namespaces make it <em>think</em> it&apos;s in its own
          isolated world. No hypervisor, no separate kernel—just clever resource partitioning.
        </p>
      </div>
    </div>
  );
}

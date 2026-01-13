'use client';

import { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import { Box, Server, Cpu, HardDrive, Layers, GripVertical, RotateCcw } from 'lucide-react';

interface App {
  id: string;
  name: string;
  size: number; // MB
  color: string;
}

interface DeployedApp {
  app: App;
  side: 'vm' | 'container';
}

const AVAILABLE_APPS: App[] = [
  { id: 'web', name: 'Web Server', size: 50, color: 'primary' },
  { id: 'api', name: 'API Service', size: 30, color: 'secondary' },
  { id: 'db', name: 'Database', size: 80, color: 'warning' },
  { id: 'cache', name: 'Cache', size: 20, color: 'danger' },
];

const VM_OVERHEAD = {
  guestOS: 512,
  kernel: 256,
  systemLibs: 128,
  services: 64,
};

const CONTAINER_OVERHEAD = {
  runtime: 50, // Shared across all containers
  perApp: 10,
};

export function ContainerVsVM() {
  const [deployedApps, setDeployedApps] = useState<DeployedApp[]>([]);
  const [draggingApp, setDraggingApp] = useState<App | null>(null);
  const [showMessage, setShowMessage] = useState<{ text: string; type: 'vm' | 'container' } | null>(null);
  const [vmHover, setVmHover] = useState(false);
  const [containerHover, setContainerHover] = useState(false);

  const vmMeterRef = useRef<HTMLDivElement>(null);
  const containerMeterRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  // Calculate resources
  const vmApps = deployedApps.filter(d => d.side === 'vm');
  const containerApps = deployedApps.filter(d => d.side === 'container');

  const vmResources = vmApps.reduce((total, d) => {
    return total + d.app.size + VM_OVERHEAD.guestOS + VM_OVERHEAD.kernel + VM_OVERHEAD.systemLibs + VM_OVERHEAD.services;
  }, 0);

  const containerResources = containerApps.length > 0
    ? CONTAINER_OVERHEAD.runtime + containerApps.reduce((total, d) => total + d.app.size + CONTAINER_OVERHEAD.perApp, 0)
    : 0;

  const maxResources = 4000; // 4GB visualization max

  // Animate meters when resources change
  useEffect(() => {
    if (vmMeterRef.current) {
      anime({
        targets: vmMeterRef.current,
        width: `${Math.min((vmResources / maxResources) * 100, 100)}%`,
        duration: 500,
        easing: 'easeOutElastic(1, 0.8)',
      });
    }
  }, [vmResources]);

  useEffect(() => {
    if (containerMeterRef.current) {
      anime({
        targets: containerMeterRef.current,
        width: `${Math.min((containerResources / maxResources) * 100, 100)}%`,
        duration: 500,
        easing: 'easeOutElastic(1, 0.8)',
      });
    }
  }, [containerResources]);

  // Show educational message
  useEffect(() => {
    if (showMessage && messageRef.current) {
      anime({
        targets: messageRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        easing: 'easeOutExpo',
      });

      const timer = setTimeout(() => {
        if (messageRef.current) {
          anime({
            targets: messageRef.current,
            opacity: [1, 0],
            translateY: [0, -10],
            duration: 300,
            easing: 'easeInExpo',
            complete: () => setShowMessage(null),
          });
        }
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  const handleDragStart = (app: App) => {
    setDraggingApp(app);
  };

  const handleDragEnd = () => {
    setDraggingApp(null);
    setVmHover(false);
    setContainerHover(false);
  };

  const handleDrop = (side: 'vm' | 'container') => {
    if (!draggingApp) return;

    // Check if app already deployed on this side
    const alreadyDeployed = deployedApps.find(
      d => d.app.id === draggingApp.id && d.side === side
    );
    if (alreadyDeployed) {
      setDraggingApp(null);
      return;
    }

    setDeployedApps(prev => [...prev, { app: draggingApp, side }]);

    // Show educational message
    if (side === 'vm') {
      setShowMessage({
        text: `Adding ${draggingApp.name}... + Guest OS (512MB) + Kernel (256MB) + System Libs (128MB) + Services (64MB) = ${draggingApp.size + 960}MB total`,
        type: 'vm',
      });
    } else {
      const isFirst = containerApps.length === 0;
      setShowMessage({
        text: isFirst
          ? `Adding ${draggingApp.name}... + Docker Runtime (50MB, shared) + App overhead (10MB) = ${draggingApp.size + 60}MB total`
          : `Adding ${draggingApp.name}... Uses existing shared kernel! + App overhead (10MB) = ${draggingApp.size + 10}MB added`,
        type: 'container',
      });
    }

    setDraggingApp(null);
    setVmHover(false);
    setContainerHover(false);
  };

  const reset = () => {
    setDeployedApps([]);
    setShowMessage(null);
  };

  const getAppColor = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary/20 border-primary/50 text-primary';
      case 'secondary': return 'bg-secondary/20 border-secondary/50 text-secondary';
      case 'warning': return 'bg-warning/20 border-warning/50 text-warning';
      case 'danger': return 'bg-danger/20 border-danger/50 text-danger';
      default: return 'bg-muted/20 border-muted/50 text-muted';
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-mono text-lg text-text">Build Your Stack</h3>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-muted hover:text-text transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Available Apps to Drag */}
      <div className="mb-6">
        <p className="text-xs text-muted mb-3 font-mono">Drag apps to deploy:</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_APPS.map(app => (
            <div
              key={app.id}
              draggable
              onDragStart={() => handleDragStart(app)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:scale-105 ${getAppColor(app.color)}`}
            >
              <GripVertical className="w-3 h-3 opacity-50" />
              <Box className="w-4 h-4" />
              <span className="text-sm font-mono">{app.name}</span>
              <span className="text-xs opacity-60">{app.size}MB</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zones */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* VM Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setVmHover(true); }}
          onDragLeave={() => setVmHover(false)}
          onDrop={() => handleDrop('vm')}
          className={`relative rounded-xl border-2 border-dashed p-4 min-h-[280px] transition-all ${
            vmHover
              ? 'border-warning bg-warning/10'
              : 'border-muted/30 bg-background/50'
          }`}
        >
          <div className="text-center mb-4">
            <span className="text-warning font-mono text-sm">Virtual Machine</span>
          </div>

          {/* VM Stack Visualization */}
          <div className="space-y-1">
            {vmApps.map((deployed, index) => (
              <div key={`${deployed.app.id}-${index}`} className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* App */}
                <div className={`rounded p-2 text-xs font-mono text-center ${getAppColor(deployed.app.color)}`}>
                  <Box className="w-3 h-3 inline mr-1" />
                  {deployed.app.name}
                </div>
                {/* Overhead layers */}
                <div className="rounded p-1.5 text-xs text-center bg-muted/20 border border-muted/30 text-muted">
                  System Libs (128MB)
                </div>
                <div className="rounded p-1.5 text-xs text-center bg-warning/10 border border-warning/30 text-warning/80">
                  Guest Kernel (256MB)
                </div>
                <div className="rounded p-2 text-xs text-center bg-warning/20 border border-warning/50 text-warning">
                  <Server className="w-3 h-3 inline mr-1" />
                  Guest OS (512MB)
                </div>
                {index < vmApps.length - 1 && (
                  <div className="border-t border-dashed border-muted/30 my-2" />
                )}
              </div>
            ))}

            {vmApps.length === 0 && (
              <div className="text-center text-muted/50 text-sm py-8">
                Drop apps here
              </div>
            )}
          </div>

          {/* Shared base for VM */}
          {vmApps.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 space-y-1">
              <div className="rounded p-2 text-xs text-center bg-danger/20 border border-danger/50 text-danger">
                <Layers className="w-3 h-3 inline mr-1" />
                Hypervisor
              </div>
            </div>
          )}
        </div>

        {/* Container Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setContainerHover(true); }}
          onDragLeave={() => setContainerHover(false)}
          onDrop={() => handleDrop('container')}
          className={`relative rounded-xl border-2 border-dashed p-4 min-h-[280px] transition-all ${
            containerHover
              ? 'border-primary bg-primary/10'
              : 'border-muted/30 bg-background/50'
          }`}
        >
          <div className="text-center mb-4">
            <span className="text-primary font-mono text-sm">Container</span>
          </div>

          {/* Container Stack Visualization */}
          <div className="space-y-2">
            {/* Apps row */}
            {containerApps.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {containerApps.map((deployed, index) => (
                  <div
                    key={`${deployed.app.id}-${index}`}
                    className={`rounded p-2 text-xs font-mono text-center flex-1 min-w-[80px] animate-in fade-in slide-in-from-top-2 duration-300 ${getAppColor(deployed.app.color)}`}
                  >
                    <Box className="w-3 h-3 inline mr-1" />
                    {deployed.app.name}
                  </div>
                ))}
              </div>
            )}

            {containerApps.length === 0 && (
              <div className="text-center text-muted/50 text-sm py-8">
                Drop apps here
              </div>
            )}

            {/* Shared layers - only show if apps exist */}
            {containerApps.length > 0 && (
              <div className="space-y-1">
                {/* Connection lines */}
                <div className="flex justify-around px-4">
                  {containerApps.map((_, index) => (
                    <div key={index} className="w-px h-4 bg-primary/50" />
                  ))}
                </div>

                <div className="rounded p-2 text-xs text-center bg-secondary/20 border border-secondary/50 text-secondary">
                  <Layers className="w-3 h-3 inline mr-1" />
                  Docker Engine (shared)
                </div>
                <div className="rounded p-2 text-xs text-center bg-primary/20 border border-primary/50 text-primary">
                  <Server className="w-3 h-3 inline mr-1" />
                  Host Kernel
                  <span className="ml-1 text-[10px] opacity-70">(shared by ALL containers)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Educational Message */}
      {showMessage && (
        <div
          ref={messageRef}
          className={`mb-4 p-4 rounded-lg border text-sm font-mono opacity-0 ${
            showMessage.type === 'vm'
              ? 'bg-warning/10 border-warning/30 text-warning'
              : 'bg-primary/10 border-primary/30 text-primary'
          }`}
        >
          {showMessage.text}
        </div>
      )}

      {/* Resource Meters */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted flex items-center gap-2">
              <HardDrive className="w-3 h-3" />
              VM Resources
            </span>
            <span className="text-xs font-mono text-warning">{vmResources}MB</span>
          </div>
          <div className="h-4 bg-background rounded-full overflow-hidden">
            <div
              ref={vmMeterRef}
              className="h-full bg-gradient-to-r from-warning/60 to-warning rounded-full"
              style={{ width: '0%' }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted flex items-center gap-2">
              <HardDrive className="w-3 h-3" />
              Container Resources
            </span>
            <span className="text-xs font-mono text-primary">{containerResources}MB</span>
          </div>
          <div className="h-4 bg-background rounded-full overflow-hidden">
            <div
              ref={containerMeterRef}
              className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Insight */}
      {vmApps.length > 0 && containerApps.length > 0 && (
        <div className="mt-6 p-4 bg-background rounded-lg border border-muted/30 text-center">
          <p className="text-sm text-muted mb-1">Same apps, different overhead:</p>
          <p className="font-mono">
            <span className="text-warning">{vmResources}MB</span>
            <span className="text-muted mx-2">vs</span>
            <span className="text-primary">{containerResources}MB</span>
          </p>
          <p className="text-xs text-muted mt-2">
            Containers use <span className="text-primary font-bold">{Math.round((1 - containerResources / vmResources) * 100)}% less</span> resources!
          </p>
        </div>
      )}

      {/* Key Takeaway */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-xs text-muted leading-relaxed">
          <span className="text-primary font-mono font-bold">Why the difference?</span> VMs virtualize hardware, requiring a full OS per instance. Containers share the host kernel—they&apos;re just isolated processes. No duplicate kernels = massive resource savings.
        </p>
      </div>
    </div>
  );
}

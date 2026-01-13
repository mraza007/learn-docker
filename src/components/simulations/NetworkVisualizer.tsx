'use client';

import { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import {
  Globe,
  Server,
  Database,
  ArrowDown,
  ArrowRight,
  Wifi,
  Settings,
  Check,
  X,
  RotateCcw
} from 'lucide-react';

interface PortMapping {
  hostPort: string;
  containerPort: string;
  container: 'web' | 'api';
}

interface RequestLog {
  id: number;
  from: string;
  to: string;
  port: string;
  status: 'success' | 'failed';
  message: string;
}

export function NetworkVisualizer() {
  const [portMappings, setPortMappings] = useState<PortMapping[]>([
    { hostPort: '8080', containerPort: '3000', container: 'web' },
  ]);
  const [newMapping, setNewMapping] = useState<{ hostPort: string; containerPort: string; container: 'web' | 'api' }>({ hostPort: '', containerPort: '', container: 'api' });
  const [showMappingForm, setShowMappingForm] = useState(false);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [animatingRequest, setAnimatingRequest] = useState<string | null>(null);
  const [requestStage, setRequestStage] = useState(0);

  const packetRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  // Animate packet through network
  const animatePacket = (stages: { x: number; y: number }[], onComplete: () => void) => {
    if (!packetRef.current) {
      onComplete();
      return;
    }

    let currentStage = 0;
    setRequestStage(0);

    const animateNextStage = () => {
      if (currentStage >= stages.length) {
        onComplete();
        return;
      }

      setRequestStage(currentStage);

      anime({
        targets: packetRef.current,
        left: stages[currentStage].x + '%',
        top: stages[currentStage].y + '%',
        duration: 300,
        easing: 'easeInOutQuad',
        complete: () => {
          currentStage++;
          setTimeout(animateNextStage, 150);
        },
      });
    };

    // Start packet visible
    anime.set(packetRef.current, { opacity: 1 });
    animateNextStage();
  };

  const sendExternalRequest = (targetPort: string) => {
    const mapping = portMappings.find(m => m.hostPort === targetPort);

    setAnimatingRequest('external-' + targetPort);

    const stages = [
      { x: 50, y: 5 },   // Internet
      { x: 50, y: 20 },  // Host
      { x: 50, y: 35 },  // Docker bridge
      { x: mapping?.container === 'web' ? 35 : 65, y: 55 }, // Container
    ];

    if (mapping) {
      animatePacket(stages, () => {
        setRequestLogs(prev => [{
          id: ++logIdRef.current,
          from: 'Internet',
          to: `${mapping.container}:${mapping.containerPort}`,
          port: targetPort,
          status: 'success' as const,
          message: `Host:${targetPort} → NAT → ${mapping.container}:${mapping.containerPort}`,
        }, ...prev].slice(0, 5));
        setAnimatingRequest(null);
        if (packetRef.current) anime.set(packetRef.current, { opacity: 0 });
      });
    } else {
      // No mapping - request fails at host
      animatePacket([stages[0], stages[1]], () => {
        setRequestLogs(prev => [{
          id: ++logIdRef.current,
          from: 'Internet',
          to: `Host:${targetPort}`,
          port: targetPort,
          status: 'failed' as const,
          message: `Port ${targetPort} not mapped - connection refused`,
        }, ...prev].slice(0, 5));
        setAnimatingRequest(null);
        if (packetRef.current) anime.set(packetRef.current, { opacity: 0 });
      });
    }
  };

  const sendContainerRequest = (from: 'web' | 'api', to: 'web' | 'api') => {
    setAnimatingRequest(`${from}-${to}`);

    const fromX = from === 'web' ? 35 : 65;
    const toX = to === 'web' ? 35 : 65;

    const stages = [
      { x: fromX, y: 55 },  // From container
      { x: fromX, y: 45 },  // Up to bridge
      { x: 50, y: 40 },     // Bridge center
      { x: toX, y: 45 },    // Down toward target
      { x: toX, y: 55 },    // Target container
    ];

    animatePacket(stages, () => {
      setRequestLogs(prev => [{
        id: ++logIdRef.current,
        from: from,
        to: to,
        port: to === 'web' ? '3000' : '5432',
        status: 'success' as const,
        message: `${from} → DNS(${to}) → 172.17.0.${to === 'web' ? '2' : '3'}`,
      }, ...prev].slice(0, 5));
      setAnimatingRequest(null);
      if (packetRef.current) anime.set(packetRef.current, { opacity: 0 });
    });
  };

  const addPortMapping = () => {
    if (!newMapping.hostPort || !newMapping.containerPort) return;

    // Check for port conflict
    if (portMappings.some(m => m.hostPort === newMapping.hostPort)) {
      setRequestLogs(prev => [{
        id: ++logIdRef.current,
        from: 'System',
        to: '',
        port: newMapping.hostPort,
        status: 'failed' as const,
        message: `Port ${newMapping.hostPort} already in use!`,
      }, ...prev].slice(0, 5));
      return;
    }

    setPortMappings(prev => [...prev, { ...newMapping }]);
    setNewMapping({ hostPort: '', containerPort: '', container: 'api' });
    setShowMappingForm(false);
  };

  const removeMapping = (hostPort: string) => {
    setPortMappings(prev => prev.filter(m => m.hostPort !== hostPort));
  };

  const reset = () => {
    setPortMappings([{ hostPort: '8080', containerPort: '3000', container: 'web' }]);
    setRequestLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* Network Diagram */}
      <div className="bg-surface rounded-xl p-6 border border-muted/30">
        <div className="relative bg-background rounded-xl min-h-[350px] overflow-hidden">
          {/* Animated packet */}
          <div
            ref={packetRef}
            className="absolute w-3 h-3 bg-primary rounded-full z-20 opacity-0 -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-primary/50"
            style={{ left: '50%', top: '5%' }}
          />

          {/* Internet */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/50">
              <Globe className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-xs text-muted mt-1 font-mono">Internet</span>
          </div>

          {/* Connection line Internet → Host */}
          <div className="absolute top-16 left-1/2 w-px h-8 bg-muted/30 -translate-x-1/2" />

          {/* Host Machine */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <div className="bg-surface/80 rounded-xl p-4 border border-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted font-mono">Host (192.168.1.100)</span>
                <div className="flex gap-1">
                  {portMappings.map(m => (
                    <span key={m.hostPort} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">
                      :{m.hostPort}
                    </span>
                  ))}
                </div>
              </div>

              {/* Docker Bridge */}
              <div className="bg-terminal rounded-lg p-4">
                <div className="text-xs text-muted mb-3 text-center font-mono">
                  docker0 bridge (172.17.0.1)
                </div>

                {/* Containers */}
                <div className="flex justify-around">
                  {/* Web Container */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => sendContainerRequest('web', 'api')}
                      disabled={!!animatingRequest}
                      className="group relative"
                    >
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 transition-all ${
                        animatingRequest?.includes('web')
                          ? 'bg-primary/30 border-primary scale-105'
                          : 'bg-primary/10 border-primary/50 hover:border-primary hover:bg-primary/20'
                      }`}>
                        <Server className="w-6 h-6 text-primary" />
                      </div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-surface px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Click to ping api
                      </span>
                    </button>
                    <span className="text-xs font-mono text-primary mt-2">web</span>
                    <span className="text-[10px] text-muted">172.17.0.2:3000</span>
                  </div>

                  {/* API Container */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => sendContainerRequest('api', 'web')}
                      disabled={!!animatingRequest}
                      className="group relative"
                    >
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 transition-all ${
                        animatingRequest?.includes('api')
                          ? 'bg-secondary/30 border-secondary scale-105'
                          : 'bg-secondary/10 border-secondary/50 hover:border-secondary hover:bg-secondary/20'
                      }`}>
                        <Database className="w-6 h-6 text-secondary" />
                      </div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-surface px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Click to ping web
                      </span>
                    </button>
                    <span className="text-xs font-mono text-secondary mt-2">api</span>
                    <span className="text-[10px] text-muted">172.17.0.3:5432</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stage indicator */}
          {animatingRequest && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-mono">
              {requestStage === 0 && 'Request sent...'}
              {requestStage === 1 && 'Reaching host...'}
              {requestStage === 2 && 'NAT translation...'}
              {requestStage === 3 && 'Routing to container...'}
              {requestStage === 4 && 'Delivered!'}
            </div>
          )}
        </div>
      </div>

      {/* Port Mapping Configuration */}
      <div className="bg-surface rounded-xl p-6 border border-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-sm text-text flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Port Mappings
          </h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowMappingForm(!showMappingForm)}
              className="text-xs text-primary hover:text-primary/80 font-mono"
            >
              + Add mapping
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted hover:text-text font-mono flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Current mappings */}
        <div className="space-y-2 mb-4">
          {portMappings.map(mapping => (
            <div
              key={mapping.hostPort}
              className="flex items-center justify-between bg-background rounded-lg px-4 py-2"
            >
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-secondary">Host:{mapping.hostPort}</span>
                <ArrowRight className="w-4 h-4 text-muted" />
                <span className="text-primary">{mapping.container}:{mapping.containerPort}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => sendExternalRequest(mapping.hostPort)}
                  disabled={!!animatingRequest}
                  className="text-xs bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition-colors font-mono"
                >
                  <Wifi className="w-3 h-3 inline mr-1" />
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => removeMapping(mapping.hostPort)}
                  className="text-xs text-danger hover:text-danger/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {portMappings.length === 0 && (
            <div className="text-center text-sm text-muted py-4">
              No port mappings. External traffic can&apos;t reach containers.
            </div>
          )}
        </div>

        {/* Add mapping form */}
        {showMappingForm && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-background rounded-lg">
            <span className="text-xs text-muted">Host port:</span>
            <input
              type="text"
              value={newMapping.hostPort}
              onChange={e => setNewMapping(prev => ({ ...prev, hostPort: e.target.value }))}
              placeholder="8081"
              className="w-16 px-2 py-1 bg-surface border border-muted/30 rounded text-sm font-mono text-text"
            />
            <ArrowRight className="w-4 h-4 text-muted" />
            <select
              value={newMapping.container}
              onChange={e => setNewMapping(prev => ({ ...prev, container: e.target.value as 'web' | 'api' }))}
              className="px-2 py-1 bg-surface border border-muted/30 rounded text-sm font-mono text-text"
            >
              <option value="web">web</option>
              <option value="api">api</option>
            </select>
            <span className="text-xs text-muted">:</span>
            <input
              type="text"
              value={newMapping.containerPort}
              onChange={e => setNewMapping(prev => ({ ...prev, containerPort: e.target.value }))}
              placeholder="3000"
              className="w-16 px-2 py-1 bg-surface border border-muted/30 rounded text-sm font-mono text-text"
            />
            <button
              type="button"
              onClick={addPortMapping}
              className="px-3 py-1 bg-primary/20 text-primary rounded text-sm hover:bg-primary/30 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Add
            </button>
          </div>
        )}

        {/* Test unmapped port */}
        <div className="mt-4 pt-4 border-t border-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Try unmapped port:</span>
            <button
              type="button"
              onClick={() => sendExternalRequest('9999')}
              disabled={!!animatingRequest}
              className="text-xs bg-danger/20 text-danger px-3 py-1 rounded hover:bg-danger/30 transition-colors font-mono"
            >
              Request :9999
            </button>
          </div>
        </div>
      </div>

      {/* Request Log */}
      {requestLogs.length > 0 && (
        <div className="bg-terminal rounded-xl p-4 border border-muted/30">
          <h4 className="font-mono text-xs text-muted mb-3">Request Log</h4>
          <div className="space-y-1">
            {requestLogs.map(log => (
              <div
                key={log.id}
                className={`text-xs font-mono flex items-center gap-2 ${
                  log.status === 'success' ? 'text-primary' : 'text-danger'
                }`}
              >
                {log.status === 'success' ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key insight */}
      <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
        <p className="text-sm text-muted">
          <span className="text-primary font-mono font-bold">Port mapping (-p): </span>
          External traffic hits the host port, gets NAT-translated, and routes to the container port.
          Without a mapping, containers are invisible to the outside world. Containers can always
          talk to each other by name on the same network.
        </p>
      </div>
    </div>
  );
}

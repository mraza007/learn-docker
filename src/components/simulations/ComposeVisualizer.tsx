'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, Database, MemoryStick, Play, Square, RefreshCw } from 'lucide-react';

type ContainerState = 'stopped' | 'starting' | 'running';

interface Service {
  name: string;
  icon: React.ReactNode;
  color: string;
  state: ContainerState;
  port?: string;
  depends?: string[];
}

export function ComposeVisualizer() {
  const [services, setServices] = useState<Service[]>([
    { name: 'db', icon: <Database className="w-6 h-6" />, color: 'warning', state: 'stopped', port: '5432' },
    { name: 'redis', icon: <MemoryStick className="w-6 h-6" />, color: 'danger', state: 'stopped', port: '6379' },
    { name: 'api', icon: <Server className="w-6 h-6" />, color: 'secondary', state: 'stopped', port: '8080', depends: ['db', 'redis'] },
    { name: 'web', icon: <Server className="w-6 h-6" />, color: 'primary', state: 'stopped', port: '3000', depends: ['api'] },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const startServices = () => {
    setIsRunning(true);
    // Start services in dependency order
    const order = ['db', 'redis', 'api', 'web'];
    order.forEach((name, i) => {
      setTimeout(() => {
        setServices(prev => prev.map(s =>
          s.name === name ? { ...s, state: 'starting' } : s
        ));
      }, i * 800);

      setTimeout(() => {
        setServices(prev => prev.map(s =>
          s.name === name ? { ...s, state: 'running' } : s
        ));
      }, i * 800 + 500);
    });
  };

  const stopServices = () => {
    // Stop in reverse order
    const order = ['web', 'api', 'redis', 'db'];
    order.forEach((name, i) => {
      setTimeout(() => {
        setServices(prev => prev.map(s =>
          s.name === name ? { ...s, state: 'stopped' } : s
        ));
      }, i * 300);
    });
    setTimeout(() => setIsRunning(false), 1200);
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-muted/30">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Docker Compose file */}
        <div>
          <h4 className="font-mono text-sm text-muted mb-3">docker-compose.yml</h4>
          <div className="bg-terminal rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre className="text-text">
{`services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret

  redis:
    image: redis:alpine

  api:
    build: ./api
    depends_on:
      - db
      - redis
    ports:
      - "8080:8080"

  web:
    build: ./web
    depends_on:
      - api
    ports:
      - "3000:3000"`}
            </pre>
          </div>
        </div>

        {/* Visual representation */}
        <div>
          <h4 className="font-mono text-sm text-muted mb-3">Service Status</h4>
          <div className="space-y-3">
            {services.map((service) => (
              <motion.div
                key={service.name}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  service.state === 'running'
                    ? `bg-${service.color}/10 border-${service.color}/50`
                    : 'bg-background border-muted/30'
                }`}
                animate={{
                  borderColor: service.state === 'running'
                    ? service.color === 'primary' ? 'rgba(0, 255, 159, 0.5)' :
                      service.color === 'secondary' ? 'rgba(0, 212, 255, 0.5)' :
                      service.color === 'warning' ? 'rgba(255, 184, 0, 0.5)' :
                      'rgba(255, 71, 87, 0.5)'
                    : 'rgba(107, 107, 107, 0.3)'
                }}
              >
                <div className={`${
                  service.color === 'primary' ? 'text-primary' :
                  service.color === 'secondary' ? 'text-secondary' :
                  service.color === 'warning' ? 'text-warning' :
                  'text-danger'
                } ${service.state === 'stopped' ? 'opacity-30' : ''}`}>
                  {service.icon}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm text-text">{service.name}</div>
                  {service.depends && (
                    <div className="text-xs text-muted">
                      depends: {service.depends.join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-muted">:{service.port}</div>
                  <div className={`text-xs font-mono ${
                    service.state === 'running' ? 'text-primary' :
                    service.state === 'starting' ? 'text-warning' :
                    'text-muted'
                  }`}>
                    {service.state === 'starting' && (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                      >
                        starting...
                      </motion.span>
                    )}
                    {service.state === 'running' && '● running'}
                    {service.state === 'stopped' && '○ stopped'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={startServices}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm ${
                isRunning
                  ? 'bg-muted/20 text-muted cursor-not-allowed'
                  : 'bg-primary/20 text-primary hover:bg-primary/30'
              }`}
            >
              <Play className="w-4 h-4" />
              docker compose up
            </button>
            <button
              onClick={stopServices}
              disabled={!isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm ${
                !isRunning
                  ? 'bg-muted/20 text-muted cursor-not-allowed'
                  : 'bg-danger/20 text-danger hover:bg-danger/30'
              }`}
            >
              <Square className="w-4 h-4" />
              docker compose down
            </button>
          </div>
        </div>
      </div>

      {/* Connection diagram */}
      {isRunning && services.every(s => s.state === 'running') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-muted/30"
        >
          <div className="text-center text-sm text-muted mb-3">Service Communication</div>
          <div className="flex items-center justify-center gap-2 font-mono text-xs">
            <span className="text-primary">web</span>
            <span className="text-muted">→</span>
            <span className="text-secondary">api</span>
            <span className="text-muted">→</span>
            <span className="text-warning">db</span>
            <span className="text-muted">/</span>
            <span className="text-danger">redis</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

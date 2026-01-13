'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, MemoryStick, Gauge } from 'lucide-react';

export function CgroupsSimulator() {
  const [cpuLimit, setCpuLimit] = useState(50);
  const [memoryLimit, setMemoryLimit] = useState(512);
  const [cpuUsage, setCpuUsage] = useState(30);
  const [memoryUsage, setMemoryUsage] = useState(256);

  const cpuThrottled = cpuUsage > cpuLimit;
  const memoryOOM = memoryUsage > memoryLimit;

  return (
    <div className="bg-surface rounded-xl p-6 border border-muted/30">
      <div className="grid md:grid-cols-2 gap-8">
        {/* CPU Control */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-secondary" />
            <span className="font-mono text-text">CPU</span>
          </div>

          {/* CPU Limit slider */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Limit</span>
              <span className="font-mono text-secondary">{cpuLimit}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={cpuLimit}
              onChange={(e) => setCpuLimit(Number(e.target.value))}
              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-secondary
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* CPU Usage slider */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Container trying to use</span>
              <span className={`font-mono ${cpuThrottled ? 'text-warning' : 'text-primary'}`}>
                {cpuUsage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={cpuUsage}
              onChange={(e) => setCpuUsage(Number(e.target.value))}
              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* CPU visualization */}
          <div className="bg-background rounded-lg p-4">
            <div className="h-8 bg-terminal rounded overflow-hidden relative">
              <motion.div
                className="h-full bg-secondary/30 absolute left-0 top-0"
                animate={{ width: `${cpuLimit}%` }}
              />
              <motion.div
                className={`h-full absolute left-0 top-0 ${cpuThrottled ? 'bg-warning' : 'bg-primary'}`}
                animate={{ width: `${Math.min(cpuUsage, cpuLimit)}%` }}
              />
              {cpuThrottled && (
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-warning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  THROTTLED
                </motion.div>
              )}
            </div>
            <div className="text-xs text-muted mt-2 text-center">
              {cpuThrottled
                ? `Container throttled: wants ${cpuUsage}%, limited to ${cpuLimit}%`
                : `Using ${cpuUsage}% of ${cpuLimit}% available`}
            </div>
          </div>
        </div>

        {/* Memory Control */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MemoryStick className="w-5 h-5 text-secondary" />
            <span className="font-mono text-text">Memory</span>
          </div>

          {/* Memory Limit slider */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Limit</span>
              <span className="font-mono text-secondary">{memoryLimit}MB</span>
            </div>
            <input
              type="range"
              min="128"
              max="1024"
              step="64"
              value={memoryLimit}
              onChange={(e) => setMemoryLimit(Number(e.target.value))}
              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-secondary
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Memory Usage slider */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Container trying to use</span>
              <span className={`font-mono ${memoryOOM ? 'text-danger' : 'text-primary'}`}>
                {memoryUsage}MB
              </span>
            </div>
            <input
              type="range"
              min="64"
              max="1024"
              step="64"
              value={memoryUsage}
              onChange={(e) => setMemoryUsage(Number(e.target.value))}
              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Memory visualization */}
          <div className="bg-background rounded-lg p-4">
            <div className="h-8 bg-terminal rounded overflow-hidden relative">
              <motion.div
                className="h-full bg-secondary/30 absolute left-0 top-0"
                animate={{ width: '100%' }}
              />
              <motion.div
                className={`h-full absolute left-0 top-0 ${memoryOOM ? 'bg-danger' : 'bg-primary'}`}
                animate={{ width: `${Math.min((memoryUsage / memoryLimit) * 100, 100)}%` }}
              />
              {memoryOOM && (
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-danger"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  OOM KILLED!
                </motion.div>
              )}
            </div>
            <div className="text-xs text-muted mt-2 text-center">
              {memoryOOM
                ? `Container killed: tried ${memoryUsage}MB, limit is ${memoryLimit}MB`
                : `Using ${memoryUsage}MB of ${memoryLimit}MB limit`}
            </div>
          </div>
        </div>
      </div>

      {/* Docker command preview */}
      <div className="mt-6 bg-terminal rounded-lg p-4">
        <div className="text-xs text-muted mb-2">Docker run command:</div>
        <code className="font-mono text-sm text-primary">
          docker run --cpus=&quot;{(cpuLimit / 100).toFixed(1)}&quot; --memory=&quot;{memoryLimit}m&quot; myapp
        </code>
      </div>
    </div>
  );
}

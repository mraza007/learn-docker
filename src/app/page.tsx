'use client';

import {
  Layer0Problem,
  Layer1Basics,
  Layer2Images,
  Layer3Isolation,
  Layer4Cgroups,
  Layer5Storage,
  Layer6Networking,
  Layer7Orchestration,
  Layer8Architecture,
} from '@/components/layers';
import { HeroSection } from '@/components/hero/HeroSection';

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      {/* Immersive Hero */}
      <HeroSection />

      {/* All Layers */}
      <Layer0Problem />
      <Layer1Basics />
      <Layer2Images />
      <Layer3Isolation />
      <Layer4Cgroups />
      <Layer5Storage />
      <Layer6Networking />
      <Layer7Orchestration />
      <Layer8Architecture />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-muted/20">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted font-mono space-y-2">
          <div>Docker Made Easy — Learn Docker Internals</div>
          <div>
            Built by{' '}
            <a
              href="https://github.com/mraza007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mraza007
            </a>
            {' · '}
            <a
              href="https://www.linkedin.com/in/muhammad-raza-07/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

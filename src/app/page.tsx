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
        <div className="max-w-4xl mx-auto text-center text-sm text-muted font-mono">
          Docker Made Easy — Learn Docker Internals
        </div>
      </footer>
    </main>
  );
}

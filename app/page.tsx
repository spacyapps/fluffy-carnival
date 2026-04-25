'use client';

import StarryBackground from './components/StarryBackground';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">

      {/* 1. Spaceship Background */}
      <img
        src="/spaceship.jpg"
        alt="Spaceship"
        className="fixed inset-0 w-full h-full object-cover scale-110 brightness-90 z-[-10]"
      />

      {/* 2. Shooting Stars Only */}
      <StarryBackground />

      {/* 3. Very Light Overlay */}
      <div className="fixed inset-0 z-[-9] bg-black/15" />

      {/* 4. Top Right Branding */}
      <div className="fixed top-8 right-8 z-50">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/30 bg-black/30 backdrop-blur-md">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
          <span className="font-space text-sm uppercase tracking-[3px] text-white/80">
            SPACYAPPS • ORBIT 2026
          </span>
        </div>
      </div>
    </main>
  );
}

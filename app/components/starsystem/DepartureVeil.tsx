'use client';

// The transition out of the star system. It lives in the root layout, so it
// outlasts the page change: it opens over the home page from the point that
// was tapped, holds on the destination's name while the route loads, and
// dissolves once the new page is underneath.

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface Departure {
  href: string;
  label: string;
  kicker: string;
  color: string;
  x: number;
  y: number;
}

const EVENT = 'ss-depart';
const OPEN_MS = 1000;
const LEAVE_MS = 1100;

export function depart(d: Departure) {
  window.dispatchEvent(new CustomEvent<Departure>(EVENT, { detail: d }));
}

type Trip = Departure & { from: string; opened: boolean; landed: boolean };

export default function DepartureVeil() {
  const router = useRouter();
  const pathname = usePathname();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const onDepart = (e: Event) => {
      const d = (e as CustomEvent<Departure>).detail;
      router.prefetch(d.href);
      setTrip({ ...d, from: window.location.pathname, opened: false, landed: false });
      requestAnimationFrame(() => requestAnimationFrame(() => setTrip(t => (t ? { ...t, opened: true } : t))));
      setTimeout(() => router.push(d.href), OPEN_MS);
      // If the page never changes (a failed load), don't leave the veil up.
      setTimeout(() => setTrip(t => (t && !t.landed ? { ...t, landed: true } : t)), OPEN_MS + 5000);
    };
    window.addEventListener(EVENT, onDepart);
    return () => window.removeEventListener(EVENT, onDepart);
  }, [router]);

  if (!trip) return null;
  const landed = trip.landed || pathname !== trip.from;
  const at = `${trip.x}px ${trip.y}px`;

  return (
    <div
      aria-hidden="true"
      onTransitionEnd={e => { if (landed && e.propertyName === 'opacity' && e.target === e.currentTarget) setTrip(null); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: landed ? 'none' : 'auto',
        background: `radial-gradient(circle at ${at}, ${trip.color} 0%, color-mix(in srgb, ${trip.color} 35%, #0e1014) 18%, #0e1014 62%)`,
        clipPath: `circle(${trip.opened ? 150 : 0}% at ${at})`,
        opacity: landed ? 0 : 1,
        transition: landed
          ? `opacity ${LEAVE_MS}ms cubic-bezier(.4,0,.2,1)`
          : `clip-path ${OPEN_MS}ms cubic-bezier(.76,0,.24,1)`,
        display: 'grid', placeItems: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          opacity: trip.opened && !landed ? 1 : 0,
          transform: `translateY(${trip.opened && !landed ? 0 : 14}px) scale(${landed ? 1.04 : 1})`,
          filter: `blur(${trip.opened && !landed ? 0 : 6}px)`,
          transition: 'opacity .7s ease .35s, transform .9s cubic-bezier(.2,.7,.2,1) .35s, filter .7s ease .35s',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 4, color: 'rgba(236,230,214,0.6)', marginBottom: 18, textTransform: 'uppercase' }}>
          {trip.kicker}
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 72, letterSpacing: -2, lineHeight: 1, color: 'var(--ink)' }}>
          {trip.label}
        </div>
      </div>
    </div>
  );
}

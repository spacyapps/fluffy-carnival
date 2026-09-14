'use client';

import { useEffect, useState } from 'react';

/**
 * The problem, before the app: a desktop full of scattered terminal
 * windows, and Ground Control as the one panel that finds whichever one
 * you're after. Cycles through which terminal is "active" so the point —
 * any row, any window, one tap — reads without a real screen recording.
 * Freezes on the first frame for prefers-reduced-motion, same rule the
 * site's video demos follow.
 */

const SESSIONS = [
  { name: 'avaterm', line: 'Bash: run full test suite' },
  { name: 'secretstuff', line: 'Timer set, Master.' },
  { name: 'GCThemes', line: 'Recolor all 241 master frames' },
  { name: 'spacyapps', line: 'Done — the three columns now run' },
];

// Scattered desktop positions — deliberately irregular, deliberately overlapping.
const TERMINALS = [
  { top: 8, left: 0, rot: -4, target: { x: 190, y: 63 } },
  { top: 146, left: 42, rot: 3, target: { x: 232, y: 201 } },
  { top: 16, left: 252, rot: 2, target: { x: 442, y: 71 } },
  { top: 176, left: 302, rot: -3, target: { x: 492, y: 231 } },
];

const ROW_Y = [80, 140, 200, 260];
const PANEL_X = 600;

function connectorPath(i: number) {
  const y0 = ROW_Y[i];
  const { x: x1, y: y1 } = TERMINALS[i].target;
  const midX = PANEL_X - (PANEL_X - x1) * 0.35;
  return `M ${PANEL_X},${y0} C ${midX},${y0} ${midX - 40},${y1} ${x1},${y1}`;
}

export default function TerminalJumpDiagram() {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setActive((a) => (a + 1) % SESSIONS.length), 2400);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 860, height: 320 }}>

        {/* connecting line, drawn under everything else */}
        <svg width={860} height={320} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {SESSIONS.map((_, i) => (
            <path
              key={i}
              d={connectorPath(i)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.4}
              strokeDasharray="4 5"
              opacity={i === active ? 0.85 : 0}
              style={{ transition: 'opacity 0.5s ease' }}
            />
          ))}
        </svg>

        {/* scattered terminal windows */}
        {TERMINALS.map((t, i) => {
          const isActive = i === active;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: t.top,
                left: t.left,
                width: 200,
                borderRadius: 10,
                overflow: 'hidden',
                background: '#08090b',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
                boxShadow: isActive ? '0 12px 40px rgba(232,168,124,0.22)' : '0 8px 24px rgba(0,0,0,0.4)',
                transform: `rotate(${t.rot}deg) scale(${isActive ? 1.06 : 1})`,
                opacity: isActive ? 1 : 0.5,
                zIndex: isActive ? 2 : 1,
                transition: 'all 0.5s ease',
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 5 }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isActive ? 'var(--ink)' : 'var(--ink-faint)', marginBottom: 6 }}>
                  {SESSIONS[i].name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faint)', lineHeight: 1.6 }}>
                  {SESSIONS[i].line}
                </div>
              </div>
            </div>
          );
        })}

        {/* the panel */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: PANEL_X - 260,
            width: 260,
            borderRadius: 12,
            overflow: 'hidden',
            background: '#0b0c10',
            border: '1px solid var(--line)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            zIndex: 3,
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
            Ground Control
          </div>
          {SESSIONS.map((s, i) => {
            const isActive = i === active;
            return (
              <div
                key={i}
                style={{
                  padding: '10px 16px',
                  borderBottom: i < SESSIONS.length - 1 ? '1px solid var(--line)' : 'none',
                  background: isActive ? 'rgba(232,168,124,0.08)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.5s ease',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--accent)' : 'var(--ink-faint)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: isActive ? 'var(--ink)' : 'var(--ink-dim)' }}>
                    {s.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

/**
 * The problem, before the app: terminals scattered across more than one
 * macOS Space, and Ground Control pinned at the right, on every Space,
 * finding whichever one you're after. Cycles which terminal is "active" —
 * two live in Space 1, one lives in Space 2 — so the point (any row, any
 * window, any Space, one tap) reads without a real screen recording.
 * Freezes on the first frame for prefers-reduced-motion, same rule the
 * site's video demos follow.
 */

const SESSIONS = [
  { label: 'Terminal 1', line: 'Bash: run full test suite', space: 1 },
  { label: 'Terminal 2', line: 'Timer set, Master.', space: 1 },
  { label: 'Terminal 5', line: 'Recolor all 241 master frames', space: 2 },
];

const TERMINALS = [
  { top: 56, left: 14, rot: -4, w: 170, target: { x: 184, y: 103 } },
  { top: 118, left: 110, rot: 3, w: 170, target: { x: 280, y: 165 } },
  { top: 96, left: 340, rot: -2, w: 180, target: { x: 520, y: 146 } },
];

// Space 2 only ever holds one terminal, so it gets a smaller box —
// no reason to give an empty Space the same footprint as a busy one.
const SPACE1 = { x: 0, y: 34, w: 300, h: 186 };
const SPACE2 = { x: 320, y: 34, w: 220, h: 186 };
const PANEL_X = 570;
const PANEL_W = 150;
const ROW_Y = [59, 111, 163];

function connectorPath(i: number) {
  const y0 = ROW_Y[i];
  const { x: x1, y: y1 } = TERMINALS[i].target;
  const midX = PANEL_X - (PANEL_X - x1) * 0.32;
  return `M ${PANEL_X},${y0} C ${midX},${y0} ${midX - 50},${y1} ${x1},${y1}`;
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

  const activeSpace = SESSIONS[active].space;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 720, height: 230 }}>

        {/* Space backdrops */}
        {[{ n: 1, r: SPACE1 }, { n: 2, r: SPACE2 }].map(({ n, r }) => (
          <div key={n} style={{ position: 'absolute', top: r.y, left: r.x, width: r.w, height: r.h, border: '1px dashed rgba(236,230,214,0.10)', borderRadius: 14 }}>
            <span
              style={{
                position: 'absolute',
                top: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: 2,
                color: activeSpace === n ? 'var(--accent)' : 'var(--ink-faint)',
                whiteSpace: 'nowrap',
                transition: 'color 0.5s ease',
              }}
            >
              SPACE {n}
            </span>
          </div>
        ))}

        {/* connecting line, drawn under the windows */}
        <svg width={720} height={230} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
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
                width: t.w,
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
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map((d) => (
                    <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, letterSpacing: 1, color: 'var(--ink-faint)' }}>CLI</span>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isActive ? 'var(--ink)' : 'var(--ink-faint)', marginBottom: 6 }}>
                  {SESSIONS[i].label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faint)', lineHeight: 1.6 }}>
                  {SESSIONS[i].line}
                </div>
              </div>
            </div>
          );
        })}

        {/* the panel — pinned at the right, taller than either Space, on top of both */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: PANEL_X,
            width: PANEL_W,
            borderRadius: 12,
            overflow: 'hidden',
            background: '#0b0c10',
            border: '1px solid var(--line)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            zIndex: 3,
          }}
        >
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--ink)' }}>
            Ground Control
          </div>
          {SESSIONS.map((s, i) => {
            const isActive = i === active;
            return (
              <div
                key={i}
                style={{
                  padding: '9px 14px',
                  borderBottom: i < SESSIONS.length - 1 ? '1px solid var(--line)' : 'none',
                  background: isActive ? 'rgba(232,168,124,0.08)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.5s ease',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--accent)' : 'var(--ink-faint)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isActive ? 'var(--ink)' : 'var(--ink-dim)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 0.5, color: 'var(--ink-faint)', marginTop: 1 }}>
                    SPACE {s.space}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 1.2, color: 'var(--ink-faint)', textAlign: 'center' }}>
            ON EVERY SPACE
          </div>
        </div>
      </div>
    </div>
  );
}

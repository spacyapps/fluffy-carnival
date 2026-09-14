'use client';

import { useEffect, useState } from 'react';

/**
 * The problem, before the app: terminals scattered across more than one
 * macOS Desktop (Mission Control's on-screen label for a Space — the
 * feature is "Spaces," but "Desktop 1/2" is what you actually see when
 * you swipe up), and Ground Control pinned at the right, on every one of
 * them, finding whichever terminal you're after. Cycles which terminal is
 * "active" — two live on Desktop 1, one lives on Desktop 2 — so the point
 * (any row, any window, any Desktop, one tap) reads without a real screen
 * recording. Freezes on the first frame for prefers-reduced-motion, same
 * rule the site's video demos follow.
 */

const NEEDS_YOU = '#ff2d55';
const DONE = '#30d158';

const SESSIONS = [
  { label: 'Terminal 1', line: 'Bash: run full test suite', space: 1, done: true },
  { label: 'Terminal 2', line: 'Needs your approval', space: 1, needsYou: true },
  { label: 'Terminal 5', line: 'Recolor all 241 master frames', space: 2, done: true },
];

const TERMINALS = [
  { top: 56, left: 14, rot: -4, w: 170, target: { x: 184, y: 103 } },
  { top: 118, left: 110, rot: 3, w: 170, target: { x: 280, y: 165 } },
  { top: 96, left: 390, rot: -2, w: 180, target: { x: 570, y: 146 } },
];

// Sits over Terminal 1 by default, like any other app window would.
// Tapping Terminal 1's row is what actually brings it to the front.
const MAIL = { top: 34, left: 66, rot: 2, w: 150 };

// Same width on purpose — a busy Desktop and a quiet one still read as
// two equal desktops, not a big one and a leftover sliver.
const SPACE1 = { x: 0, y: 34, w: 300, h: 186 };
const SPACE2 = { x: 320, y: 34, w: 300, h: 186 };
const PANEL_X = 650;
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
      <div style={{ position: 'relative', width: 800, height: 230 }}>

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
              DESKTOP {n}
            </span>
          </div>
        ))}

        {/* connecting line, drawn under the windows */}
        <svg width={800} height={230} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
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

        {/* a Mail window sitting over Terminal 1, same as any other app would */}
        <div
          style={{
            position: 'absolute',
            top: MAIL.top,
            left: MAIL.left,
            width: MAIL.w,
            borderRadius: 10,
            overflow: 'hidden',
            background: '#0d0e12',
            border: '1px solid var(--line)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
            transform: `rotate(${MAIL.rot}deg) scale(${active === 0 ? 0.97 : 1})`,
            opacity: active === 0 ? 0.4 : 0.75,
            zIndex: 2,
            transition: 'all 0.5s ease',
          }}
        >
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, letterSpacing: 1, color: 'var(--ink-faint)' }}>MAIL</span>
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', marginBottom: 6 }}>Inbox (3)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faint)', lineHeight: 1.6 }}>Re: Deploy checklist</div>
          </div>
        </div>

        {/* scattered terminal windows */}
        {TERMINALS.map((t, i) => {
          const isActive = i === active;
          const needsYou = SESSIONS[i].needsYou;
          const flagColor = needsYou ? NEEDS_YOU : 'var(--accent)';
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
                border: `1px solid ${isActive ? flagColor : needsYou ? 'rgba(255,45,85,0.4)' : 'var(--line)'}`,
                boxShadow: isActive
                  ? `0 12px 40px ${needsYou ? 'rgba(255,45,85,0.28)' : 'rgba(232,168,124,0.22)'}`
                  : needsYou
                  ? '0 0 22px rgba(255,45,85,0.14)'
                  : '0 8px 24px rgba(0,0,0,0.4)',
                transform: `rotate(${t.rot}deg) scale(${isActive ? 1.06 : 1})`,
                opacity: isActive ? 1 : 0.5,
                zIndex: isActive ? 3 : 1,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {needsYou && <div style={{ width: 5, height: 5, borderRadius: '50%', background: NEEDS_YOU, flexShrink: 0 }} />}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isActive ? 'var(--ink)' : 'var(--ink-faint)' }}>
                    {SESSIONS[i].label}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: needsYou ? 'rgba(255,45,85,0.75)' : 'var(--ink-faint)', lineHeight: 1.6 }}>
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
            zIndex: 5,
          }}
        >
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--ink)' }}>
            Ground Control
          </div>
          {SESSIONS.map((s, i) => {
            const isActive = i === active;
            const dotColor = s.needsYou ? NEEDS_YOU : s.done ? DONE : isActive ? 'var(--accent)' : 'var(--ink-faint)';
            const rowTint = isActive
              ? 'rgba(232,168,124,0.08)'
              : s.needsYou
              ? 'rgba(255,45,85,0.06)'
              : s.done
              ? 'rgba(48,209,88,0.05)'
              : 'transparent';
            return (
              <div
                key={i}
                style={{
                  padding: '9px 14px',
                  borderBottom: i < SESSIONS.length - 1 ? '1px solid var(--line)' : 'none',
                  background: rowTint,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.5s ease',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isActive ? 'var(--ink)' : 'var(--ink-dim)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 0.5, color: 'var(--ink-faint)', marginTop: 1 }}>
                    DESKTOP {s.space}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 1.2, color: 'var(--ink-faint)', textAlign: 'center' }}>
            ON EVERY DESKTOP
          </div>
        </div>
      </div>
    </div>
  );
}

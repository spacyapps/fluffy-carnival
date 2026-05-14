'use client';
import { useState, useEffect } from 'react';

const AMBER = 'rgba(210,160,70,1)';
const GREEN = 'rgba(80,200,120,1)';
const RED = 'rgba(220,90,80,1)';

export default function SonarCommentSVG() {
  const [phase, setPhase] = useState(0); // 0=in-sync 1=code-changed 2=sonar-flag 3=updated

  useEffect(() => {
    const durations = [2500, 1200, 2800, 2500];
    const t = setTimeout(() => setPhase(p => (p + 1) % 4), durations[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const label = ['COMMENT IN SYNC', 'CODE UPDATED…', '⚠  COMMENT OUTDATED', '✦ COMMENT UPDATED'][phase];
  const labelColor = phase === 2 ? RED : phase === 3 ? GREEN : 'rgba(255,255,255,0.2)';

  // Comment text changes between phases
  const commentText = phase === 3
    ? '// saves gesture at 320×460 — DO NOT resize canvas'
    : '// saves gesture — called at step 3';

  const commentColor = phase === 2
    ? RED
    : phase === 3
    ? GREEN
    : AMBER;

  // The function body line changes in phase 1+
  const fnBodyColor = phase >= 1
    ? 'rgba(110,170,255,0.5)'
    : 'rgba(255,255,255,0.13)';

  return (
    <div style={{ margin: '32px 0' }}>
      <svg width="580" height="210" viewBox="0 0 580 210" style={{ display: 'block', borderRadius: 12, overflow: 'hidden' }}>
        {/* Background */}
        <rect width="580" height="210" fill="var(--surface)" />
        <rect width="580" height="210" fill="none" stroke="var(--line)" strokeWidth="1" rx="12" />

        {/* Traffic lights */}
        <circle cx="20" cy="16" r="4.5" fill="rgba(255,90,90,0.5)" />
        <circle cx="34" cy="16" r="4.5" fill="rgba(255,195,50,0.5)" />
        <circle cx="48" cy="16" r="4.5" fill="rgba(50,200,80,0.4)" />
        <text x="290" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="rgba(255,255,255,0.2)" letterSpacing="1">
          GestureStore.swift
        </text>
        <line x1="0" y1="30" x2="580" y2="30" stroke="var(--line)" strokeWidth="1" />

        {/* Gutter */}
        <line x1="42" y1="30" x2="42" y2="193" stroke="var(--line)" strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Line numbers */}
        {[24, 25, 26, 27, 28, 29].map((n, i) => (
          <text key={n} x="28" y={52 + i * 26} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9" fill="rgba(255,255,255,0.12)">{n}</text>
        ))}

        {/* func save() { */}
        <text x="52" y="52" fontFamily="var(--font-mono)" fontSize="11" fill="rgba(255,255,255,0.35)">
          {'func save() {'}
        </text>

        {/* comment line */}
        <text x="68" y="78" fontFamily="var(--font-mono)" fontSize="11" fill={commentColor}
          style={{ transition: 'fill 0.4s' }}>
          {commentText}
        </text>
        {phase === 2 && (
          <rect x="66" y="64" width="320" height="20" rx="3"
            fill="rgba(220,90,80,0.08)" stroke={RED} strokeWidth="0.8" strokeOpacity="0.6" />
        )}
        {phase === 3 && (
          <rect x="66" y="64" width="320" height="20" rx="3"
            fill="rgba(80,200,120,0.08)" stroke={GREEN} strokeWidth="0.8" strokeOpacity="0.6" />
        )}

        {/* body lines */}
        <rect x="68" y="92" width="220" height="9" rx="2" fill={fnBodyColor} />
        <rect x="68" y="110" width="175" height="9" rx="2" fill={fnBodyColor} />
        <rect x="68" y="128" width="195" height="9" rx="2" fill={fnBodyColor} />

        {/* closing brace */}
        <text x="52" y="156" fontFamily="var(--font-mono)" fontSize="11" fill="rgba(255,255,255,0.35)">{'}'}</text>

        {/* Sonar badge */}
        {phase >= 2 && (
          <g>
            <rect x="400" y="60" width="162" height="38" rx="6"
              fill={phase === 3 ? 'rgba(80,200,120,0.1)' : 'rgba(220,90,80,0.1)'}
              stroke={phase === 3 ? GREEN : RED}
              strokeWidth="1" strokeOpacity="0.7" />
            <text x="414" y="76" fontFamily="var(--font-mono)" fontSize="9"
              fill={phase === 3 ? GREEN : RED} letterSpacing="1">
              {phase === 3 ? '✦ SONAR PASS' : '⚠ SONAR'}
            </text>
            <text x="414" y="90" fontFamily="var(--font-mono)" fontSize="9"
              fill={phase === 3 ? GREEN : RED} letterSpacing="0.5" opacity="0.8">
              {phase === 3 ? 'Comment updated' : 'Comment outdated'}
            </text>
          </g>
        )}

        {/* Bottom label */}
        <line x1="0" y1="193" x2="580" y2="193" stroke="var(--line)" strokeWidth="0.5" strokeOpacity="0.5" />
        <text x="290" y="206" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9"
          fill={labelColor} letterSpacing="2">
          {label}
        </text>
      </svg>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';

const LINES = [
  { w: 155, comment: false },
  { w: 210, comment: false },
  { w: 125, comment: false },
  { w: 235, comment: true },
  { w: 180, comment: false },
  { w: 148, comment: false },
  { w: 195, comment: false },
];

const LINE_H = 26;
const CODE_Y = 48;
const COMMENT_IDX = 3;
const AMBER = 'rgba(210,160,70,1)';
const AMBER_DIM = 'rgba(210,160,70,0.3)';
const BLUE = 'rgba(110,170,255,1)';

export default function CommentContextSVG() {
  const [phase, setPhase] = useState(0); // 0=static 1=scanning 2=found
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    if (phase === 0) {
      const t = setTimeout(() => { setScanLine(0); setPhase(1); }, 2800);
      return () => clearTimeout(t);
    }
    if (phase === 1) {
      if (scanLine < COMMENT_IDX) {
        const t = setTimeout(() => setScanLine(s => s + 1), 320);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase(2), 350);
      return () => clearTimeout(t);
    }
    if (phase === 2) {
      const t = setTimeout(() => { setScanLine(0); setPhase(0); }, 3200);
      return () => clearTimeout(t);
    }
  }, [phase, scanLine]);

  const scanY = CODE_Y + scanLine * LINE_H;
  const commentY = CODE_Y + COMMENT_IDX * LINE_H;

  const label = phase === 0
    ? 'COMMENT IN THE CODE'
    : phase === 1
    ? 'AI READS THE FILE'
    : '✦ CONTEXT — INSTANT, IN PLACE';

  return (
    <div style={{ margin: '32px 0' }}>
      <svg width="580" height="240" viewBox="0 0 580 240" style={{ display: 'block', borderRadius: 12, overflow: 'hidden' }}>
        {/* Background */}
        <rect width="580" height="240" fill="var(--surface)" />
        <rect width="580" height="240" fill="none" stroke="var(--line)" strokeWidth="1" rx="12" />

        {/* Traffic lights */}
        <circle cx="20" cy="16" r="4.5" fill="rgba(255,90,90,0.5)" />
        <circle cx="34" cy="16" r="4.5" fill="rgba(255,195,50,0.5)" />
        <circle cx="48" cy="16" r="4.5" fill="rgba(50,200,80,0.4)" />

        {/* Filename */}
        <text x="290" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="rgba(255,255,255,0.2)" letterSpacing="1">
          ViewController.swift
        </text>

        {/* Header line */}
        <line x1="0" y1="30" x2="580" y2="30" stroke="var(--line)" strokeWidth="1" />

        {/* Line numbers */}
        {LINES.map((_, li) => (
          <text key={li} x="28" y={CODE_Y + li * LINE_H + 16} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9" fill="rgba(255,255,255,0.12)">
            {12 + li}
          </text>
        ))}

        {/* Gutter line */}
        <line x1="42" y1="30" x2="42" y2="220" stroke="var(--line)" strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Code lines */}
        {LINES.map((line, li) => {
          const y = CODE_Y + li * LINE_H;
          const isComment = line.comment;
          const isFound = phase === 2 && isComment;
          const isScanned = phase === 1 && li < scanLine;
          const codeFill = isFound
            ? 'rgba(255,255,255,0.06)'
            : isScanned
            ? 'rgba(110,170,255,0.08)'
            : 'rgba(255,255,255,0.13)';

          if (isComment) {
            return (
              <g key={li}>
                {isFound && (
                  <rect x="44" y={y + 2} width="310" height={LINE_H - 4} rx="4"
                    fill="rgba(210,160,70,0.1)" stroke={AMBER} strokeWidth="0.5" strokeOpacity="0.5" />
                )}
                <text x="52" y={y + 16} fontFamily="var(--font-mono)" fontSize="11"
                  fill={isFound ? AMBER : AMBER_DIM}>
                  //
                </text>
                <rect x="68" y={y + 6} width={line.w} height="9" rx="2"
                  fill={isFound ? 'rgba(210,160,70,0.5)' : 'rgba(210,160,70,0.2)'} />
              </g>
            );
          }

          return (
            <rect key={li} x="52" y={y + 6} width={line.w} height="9" rx="2" fill={codeFill} />
          );
        })}

        {/* Scanner beam */}
        {phase === 1 && (
          <rect x="44" y={scanY + 2} width="340" height={LINE_H - 4} rx="4"
            fill="rgba(110,170,255,0.08)" stroke={BLUE} strokeWidth="0.8" strokeOpacity="0.5" />
        )}

        {/* Context badge */}
        {phase === 2 && (
          <g>
            <line x1="316" y1={commentY + LINE_H / 2} x2="348" y2={commentY + LINE_H / 2}
              stroke={AMBER} strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 2" />
            <rect x="350" y={commentY + 4} width="130" height={LINE_H - 8} rx="5"
              fill="rgba(210,160,70,0.12)" stroke={AMBER} strokeWidth="1" strokeOpacity="0.7" />
            <text x="415" y={commentY + LINE_H / 2 + 4} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="9" fill={AMBER} letterSpacing="1.5">
              ✦ CONTEXT
            </text>
          </g>
        )}

        {/* Bottom label */}
        <line x1="0" y1="222" x2="580" y2="222" stroke="var(--line)" strokeWidth="0.5" strokeOpacity="0.5" />
        <text x="290" y="235" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9"
          fill={phase === 2 ? AMBER : 'rgba(255,255,255,0.2)'} letterSpacing="2">
          {label}
        </text>
      </svg>
    </div>
  );
}

'use client';

import { useState } from 'react';

/**
 * Prelim placeholder — not wired to a real list yet. On submit it just
 * confirms locally; no request goes anywhere. Swap the onSubmit body for a
 * real provider before this page ever links from anywhere public.
 */
export default function ThemeWaitlistForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSent(true);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440 }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="email"
          required
          disabled={sent}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@wherever.com"
          style={{
            flex: 1,
            background: 'rgba(236,230,214,0.05)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '13px 20px',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={sent}
          style={{
            background: sent ? 'transparent' : 'var(--accent)',
            border: sent ? '1px solid var(--line)' : 'none',
            color: sent ? 'var(--ink-dim)' : '#1a1610',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 999,
            padding: '13px 26px',
            cursor: sent ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {sent ? 'On the list' : 'Notify me'}
        </button>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1, color: 'var(--ink-faint)', margin: 0 }}>
        {sent
          ? 'Held locally for this preview only — nothing was actually sent anywhere yet.'
          : 'Prelim page: this form isn’t wired to a real list yet.'}
      </p>
    </form>
  );
}

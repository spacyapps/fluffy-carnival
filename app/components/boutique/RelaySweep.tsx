// The contact section's radar: the relay from the hero, listening. Each blip
// is a mission (green if live, mist if under construction), and the beam
// lights them as it passes. All CSS; the keyframes live in globals.css.

const PERIOD = 9; // seconds per sweep
const SIZE = 560;

export default function RelaySweep({ blips }: { blips: { live: boolean }[] }) {
  const ring = (d: number, dashed = false) => (
    <div style={{
      position: 'absolute', left: '50%', top: '50%', width: d, height: d, transform: 'translate(-50%, -50%)',
      borderRadius: '50%', border: `1px ${dashed ? 'dashed' : 'solid'} rgba(236,230,214,${dashed ? 0.1 : 0.06})`,
    }} />
  );
  return (
    <div aria-hidden="true" style={{ position: 'absolute', right: -90, top: '50%', width: SIZE, height: SIZE, transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      {ring(SIZE, true)}
      {ring(SIZE * 0.72)}
      {ring(SIZE * 0.46)}
      {ring(SIZE * 0.2)}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(236,230,214,0.04)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(236,230,214,0.04)' }} />

      {/* The beam: a fading wedge whose leading edge sits at 12 o'clock at t=0. */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, transparent 0deg 290deg, rgba(232,168,124,0.03) 310deg, rgba(232,168,124,0.16) 360deg)',
        animation: `jr-spin ${PERIOD}s linear infinite`,
      }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '50%', background: 'linear-gradient(to top, rgba(232,168,124,0.5), transparent)' }} />
      </div>

      {/* Missions on the scope; each flashes when the beam reaches its angle. */}
      {blips.map((b, i) => {
        const angle = (i * 137.5 + 40) % 360; // golden-angle spread, clockwise from 12 o'clock
        const radius = SIZE / 2 * (0.3 + 0.55 * ((i + 0.5) / blips.length));
        const rad = angle * Math.PI / 180;
        const color = b.live ? 'var(--live)' : 'var(--accent-2)';
        return (
          <span key={i} style={{
            position: 'absolute', left: SIZE / 2 + Math.sin(rad) * radius, top: SIZE / 2 - Math.cos(rad) * radius,
            width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}`,
            opacity: 0.18, transform: 'translate(-50%, -50%)',
            animation: `relay-blip ${PERIOD}s linear ${(angle / 360 * PERIOD).toFixed(2)}s infinite`,
          }} />
        );
      })}

      {/* Pings go out only while the email address is hovered (see globals.css). */}
      {[0, 0.6, 1.2].map(delay => (
        <div key={delay} className="relay-ping" style={{
          position: 'absolute', left: '50%', top: '50%', width: SIZE, height: SIZE, borderRadius: '50%',
          border: '1px solid rgba(232,168,124,0.55)', animationDelay: `${delay}s`,
        }} />
      ))}

      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 7, height: 7, borderRadius: '50%', transform: 'translate(-50%, -50%)', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)', animation: 'bo-pulse 2.4s ease-in-out infinite' }} />
    </div>
  );
}

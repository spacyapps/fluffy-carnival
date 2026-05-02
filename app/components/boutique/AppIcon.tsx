import Image from 'next/image';

export default function AppIcon({
  glyph,
  color,
  size = 60,
  icon,
}: {
  glyph: string;
  color: string;
  size?: number;
  icon?: string;
}) {
  const radius = size * 0.28;
  const shadow = 'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 20px rgba(0,0,0,0.3)';

  if (icon) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          flexShrink: 0,
          overflow: 'hidden',
          boxShadow: shadow,
          position: 'relative',
        }}
      >
        <Image src={icon} alt={glyph} fill sizes={`${size}px`} style={{ objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: `linear-gradient(150deg, ${color}, oklch(0.4 0.12 from ${color} h))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'var(--font-serif)',
        fontSize: size * 0.5,
        fontWeight: 500,
        boxShadow: shadow,
      }}
    >
      {glyph}
    </div>
  );
}

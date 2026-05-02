export default function Logotype({
  size = 28,
  color,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size,
        letterSpacing: size * 0.18,
        color: color ?? 'var(--ink)',
        lineHeight: 1,
        textTransform: 'uppercase',
      }}
    >
      S P A C Y A P P S
    </span>
  );
}

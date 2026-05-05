import Link from 'next/link';
import Logotype from './Logotype';

export default function Nav() {
  return (
    <nav
      className="bo-nav"
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '20px 0 56px',
        zIndex: 3,
      }}
    >
      <div className="bo-nav-left" style={{ display: 'flex', gap: 28, fontSize: 14, color: 'var(--ink-dim)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>
        <Link href="#missions" className="bo-link" style={{ color: 'inherit' }}>Missions</Link>
        <Link href="#log" className="bo-link" style={{ color: 'inherit' }}>Log</Link>
        <Link href="#now" className="bo-link" style={{ color: 'inherit' }}>Now</Link>
      </div>
      <Logotype size={14} />
      <div className="bo-nav-right" style={{ display: 'flex', gap: 28, justifyContent: 'flex-end', fontSize: 14, color: 'var(--ink-dim)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>
        <Link href="#contact" className="bo-link" style={{ color: 'inherit' }}>About</Link>
        <Link href="#contact" className="bo-link" style={{ color: 'inherit' }}>Contact</Link>
      </div>
    </nav>
  );
}

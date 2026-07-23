import Link from 'next/link';
import DandelionMark from '@/components/vault/DandelionMark';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#0C1519' }}
    >
      {/* Subtle radial glow behind the mark */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(207,157,123,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
        }}
      />

      {/* Dandelion mark */}
      <div className="relative z-10">
        <DandelionMark size={220} color="#CF9D7B" stemColor="#724B39" animate={true} />
      </div>

      {/* Small wordmark */}
      <h1
        className="relative z-10 mt-4 select-none tracking-tight"
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 900,
          fontSize: 'clamp(24px, 5vw, 32px)',
          lineHeight: 1,
          color: '#CF9D7B',
          letterSpacing: '-0.02em',
        }}
      >
        {'HEIR'}
        <span style={{ color: '#724B39' }}>L</span>
        {'O'}
      </h1>

      {/* Tagline */}
      <p
        className="relative z-10 mt-5"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: 'clamp(14px, 2.5vw, 20px)',
          color: 'rgba(207,157,123,0.55)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Legacy, clarified.
      </p>

      {/* CTA */}
      <Link
        href="/auth/login"
        className="relative z-10 mt-12 inline-block transition-all hover:opacity-90"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 400,
          fontSize: '14px',
          color: '#0C1519',
          backgroundColor: '#CF9D7B',
          padding: '14px 40px',
          borderRadius: '12px',
          letterSpacing: '0.04em',
        }}
      >
        Get started
      </Link>
    </div>
  );
}

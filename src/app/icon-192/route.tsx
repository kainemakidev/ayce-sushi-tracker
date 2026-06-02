import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(<AppIcon size={192} />, { width: 192, height: 192 });
}

function AppIcon({ size }: { size: number }) {
  const radius = size * 0.22;
  const fontSize = size * 0.52;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)',
        borderRadius: radius,
      }}
    >
      <span style={{ fontSize, lineHeight: 1 }}>🍣</span>
    </div>
  );
}

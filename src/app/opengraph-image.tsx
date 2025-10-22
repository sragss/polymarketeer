import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Polymarketeer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  // Read the logo file and convert to base64
  const logoData = await readFile(
    join(process.cwd(), 'public/favicon/icon-original.png'),
    'base64'
  );
  const logoSrc = `data:image/png;base64,${logoData}`;

  // Fetch Inter font for better typography
  const interBold = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff')
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          position: 'relative',
        }}
      >
        {/* Smooth gradient background */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(30, 58, 138, 0.2) 25%, rgba(15, 23, 42, 0) 50%, rgba(249, 115, 22, 0.15) 75%, rgba(255, 159, 64, 0.2) 100%)',
          }}
        />

        {/* Subtle dot grid overlay */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage:
              'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: 60,
          }}
        >
          {/* Logo */}
          <img
            src={logoSrc}
            width="120"
            height="120"
            style={{
              marginBottom: '40px',
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: 20,
              letterSpacing: '-0.02em',
              fontFamily: '"Inter"',
            }}
          >
            Polymarketeer
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: '#cbd5e1',
              textAlign: 'center',
              maxWidth: 800,
              fontFamily: '"Inter"',
              fontWeight: 500,
            }}
          >
            Agentically explore Polymarket and Kalshi
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: interBold,
          style: 'normal',
          weight: 900,
        },
      ],
    }
  );
}

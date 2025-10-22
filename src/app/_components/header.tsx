import { EchoAccount } from '@/components/echo-account-next';
import { isSignedIn } from '@/echo';
import Link from 'next/link';
import type { FC } from 'react';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = async ({
  title = 'Polymarketeer',
  className = '',
}) => {
  const signedIn = await isSignedIn();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background backdrop-blur-sm shadow-sm ${className}`}
    >
      <div className="h-12 px-4 flex items-center justify-between max-w-full">
        {/* Logo + Name + Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/favicon/icon-original.png" alt="Polymarketeer" className="h-5 w-5" />
            <span className="font-semibold text-sm tracking-tight">{title}</span>
          </Link>

          {signedIn && (
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/market"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Markets
              </Link>
            </nav>
          )}
        </div>

        {/* Live Stats - Center */}
        {signedIn && (
          <div className="hidden md:flex items-center gap-6 font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="text-[hsl(var(--text-tertiary))]">Vol:</span>
              <span className="text-volume font-medium">$847M</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[hsl(var(--text-tertiary))]">Markets:</span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[hsl(var(--text-tertiary))]">Updated:</span>
              <span className="font-medium">2s ago</span>
            </div>
          </div>
        )}

        {/* Account */}
        <nav className="flex items-center gap-2">
          <EchoAccount />
        </nav>
      </div>
    </header>
  );
};

export default Header;

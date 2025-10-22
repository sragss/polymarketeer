'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/echo-button';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function EchoConnectDialog() {
  const { user, signIn, isLoading } = useEcho();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Dialog is open when there's no user and not loading
  const isOpen = !user && !isLoading;

  const handleSignIn = () => {
    setIsSigningIn(true);
    signIn();
  };

  return (
    <Dialog open={isOpen} modal>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Logo className="size-16" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Connect with Echo
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in with Echo to start using Polymarketeer. You'll need an
            account to access AI features and track your usage.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full"
            size="lg"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Logo className="size-5" />
                Connect with Echo
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            New to Echo?{' '}
            <a
              href="https://echo.merit.systems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Learn more
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

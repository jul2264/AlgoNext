import { UserButton, useUser, SignInButton, useAuth } from '@clerk/react';

export function Navbar() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  return (
    <header className="h-auto py-1 border-b border-border-default bg-bg-primary sticky top-0 z-20 flex items-center justify-end px-8 shadow-sm">
      <div className="flex items-center gap-6 cursor-pointer group bg-bg-elevated p-2 pr-4 pl-12 rounded-xl border border-border-default shadow-sm">
        {isSignedIn ? (
          <>
            <div className="text-right hidden md:block group-hover:opacity-80 transition-opacity">
              <div className="text-base font-semibold text-text-primary font-mono leading-tight">{user?.fullName || 'User'}</div>
              <div className="text-xs text-text-muted capitalize font-mono leading-tight mt-1.5">{String(user?.publicMetadata?.role || 'Student')}</div>
            </div>
            <div className="border-2 border-border-default rounded-full p-0.5 group-hover:border-accent-secondary group-hover:shadow-[0_0_12px_rgba(0,255,204,0.4)] transition-all duration-300 overflow-hidden flex items-center justify-center bg-bg-primary">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-11 h-11 rounded-full", avatarBox: "rounded-full" } }} />
            </div>
          </>
        ) : (
          <SignInButton mode="modal">
            <button className="text-sm font-semibold text-bg-primary bg-accent-secondary px-6 py-2 rounded-full hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,204,0.3)]">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}

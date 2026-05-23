import { UserButton, useUser } from '@clerk/react';
import { Bell, Sparkles } from 'lucide-react';

export function Navbar() {
  const { user } = useUser();

  return (
    <header className="h-12 border-b border-border-default bg-bg-primary/90 backdrop-blur-md sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div 
        className="w-full mx-auto h-full flex items-center justify-between"
        style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
      >
      {/* Search (Removed as requested) */}
      <div className="flex-1"></div>

      {/* Right side icons & user */}
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-sm font-mono font-bold text-bg-primary bg-accent-tertiary px-5 py-2 rounded-md hover:bg-white hover:shadow-[0_0_15px_rgba(255,224,74,0.6)] transition-all">
          <Sparkles size={16} />
          <span>PRO</span>
        </button>

        <button className="relative text-text-muted hover:text-accent-secondary hover:drop-shadow-[0_0_8px_rgba(0,255,204,0.8)] transition-all hover:scale-110 active:scale-95 duration-200">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-primary border border-bg-primary shadow-[0_0_8px_rgba(255,45,120,0.8)]"></span>
        </button>

        <div className="h-6 w-px bg-border-hover"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block group-hover:opacity-80 transition-opacity">
            <div className="text-sm font-semibold text-text-primary font-mono">{user?.fullName || 'User'}</div>
            <div className="text-xs text-text-muted capitalize font-mono">{String(user?.publicMetadata?.role || 'Student')}</div>
          </div>
          <div className="border border-border-default rounded-full p-0.5 group-hover:border-accent-secondary group-hover:shadow-[0_0_12px_rgba(0,255,204,0.4)] transition-all duration-300">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}

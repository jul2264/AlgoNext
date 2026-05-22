import { UserButton, useUser } from '@clerk/clerk-react';
import { Bell, Search } from 'lucide-react';

export function Navbar() {
  const { user } = useUser();

  return (
    <header className="h-16 flex items-center justify-between border-b border-border-default px-8 bg-bg-primary">
      {/* Search */}
      <div className="flex items-center bg-bg-secondary border border-border-default rounded-full px-4 py-1.5 w-96 focus-within:border-accent-primary transition-colors">
        <Search size={16} className="text-text-muted mr-2" />
        <input 
          type="text" 
          placeholder="Search curriculum, problems..." 
          className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-muted"
        />
      </div>

      {/* Right side icons & user */}
      <div className="flex items-center gap-6">
        <button className="relative text-text-muted hover:text-text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent-primary"></span>
        </button>

        <div className="h-8 w-px bg-border-default"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-text-primary">{user?.fullName || 'User'}</div>
            <div className="text-xs text-text-muted capitalize">{String(user?.publicMetadata?.role || 'Student')}</div>
          </div>
          <div className="border-2 border-border-default rounded-full p-0.5 hover:border-accent-primary transition-colors">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
          </div>
        </div>
      </div>
    </header>
  );
}

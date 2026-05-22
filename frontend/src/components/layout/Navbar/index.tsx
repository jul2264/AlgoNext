import { UserButton, useUser } from '@clerk/clerk-react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Navbar() {
  const { user } = useUser();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between border-b border-border-default px-8 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10">
      {/* Search */}
      <motion.div 
        animate={{ 
          width: isSearchFocused ? 450 : 384,
          borderColor: isSearchFocused ? 'var(--color-accent-primary)' : 'var(--color-border-default)'
        }}
        className="flex items-center bg-bg-secondary/50 border rounded-full px-4 py-1.5 transition-shadow shadow-inner"
      >
        <Search size={16} className={`mr-2 transition-colors ${isSearchFocused ? 'text-accent-primary' : 'text-text-muted'}`} />
        <input 
          type="text" 
          placeholder="Search curriculum, problems..." 
          className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-muted"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        <div className="flex items-center gap-1 opacity-50 ml-2">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-tertiary rounded border border-border-default text-text-muted">Ctrl</kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-tertiary rounded border border-border-default text-text-muted">K</kbd>
        </div>
      </motion.div>

      {/* Right side icons & user */}
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-xs font-medium text-accent-secondary bg-accent-secondary/10 px-3 py-1.5 rounded-full border border-accent-secondary/20 hover:bg-accent-secondary/20 transition-colors">
          <Sparkles size={14} />
          <span>Pro</span>
        </button>

        <button className="relative text-text-muted hover:text-text-primary transition-colors hover:scale-110 active:scale-95 duration-200">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-primary border-2 border-bg-primary"></span>
        </button>

        <div className="h-6 w-px bg-border-default"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block group-hover:opacity-80 transition-opacity">
            <div className="text-sm font-semibold text-text-primary">{user?.fullName || 'User'}</div>
            <div className="text-xs text-text-muted capitalize">{String(user?.publicMetadata?.role || 'Student')}</div>
          </div>
          <div className="border-2 border-border-default rounded-full p-0.5 group-hover:border-accent-primary transition-colors shadow-lg">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
          </div>
        </div>
      </div>
    </header>
  );
}

import { UserButton, useUser } from '@clerk/clerk-react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Navbar() {
  const { user } = useUser();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-16 border-b border-border-default bg-bg-primary/90 backdrop-blur-md sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 w-full h-full flex items-center justify-between">
      {/* Search */}
      <motion.div 
        animate={{ 
          width: isSearchFocused ? 450 : 384,
          borderColor: isSearchFocused ? 'var(--color-accent-secondary)' : 'rgba(255, 255, 255, 0.2)',
          boxShadow: isSearchFocused ? '0 0 12px rgba(0, 255, 204, 0.2)' : '0 0 8px rgba(0,0,0,0.5)'
        }}
        className="flex items-center bg-bg-tertiary border border-white/20 rounded-lg px-4 py-2 transition-all duration-300"
      >
        <Search size={16} className={`mr-2 transition-colors ${isSearchFocused ? 'text-accent-secondary drop-shadow-[0_0_8px_currentColor]' : 'text-text-secondary'}`} />
        <input 
          type="text" 
          placeholder="Search curriculum, problems..." 
          className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-secondary font-mono"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        <div className="flex items-center gap-1 opacity-50 ml-2">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-secondary rounded border border-border-default text-text-muted">Ctrl</kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-secondary rounded border border-border-default text-text-muted">K</kbd>
        </div>
      </motion.div>

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

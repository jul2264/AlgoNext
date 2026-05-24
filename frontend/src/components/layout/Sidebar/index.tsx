import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, UserCircle, LogOut, Code2, PlaySquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@clerk/react';
import { motion, AnimatePresence } from 'motion/react';

export function Sidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  
  // Auto-collapse if we are in the problem workspace
  const isProblemWorkspace = location.pathname.startsWith('/problems/');
  
  const [isCollapsed, setIsCollapsed] = useState(isProblemWorkspace);

  // Sync state if navigation changes to/from problem workspace
  useEffect(() => {
    if (isProblemWorkspace) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [isProblemWorkspace]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Playground', path: '/playground', icon: Code2 },
    { name: 'DSA', path: '/dsa', icon: BookOpen },
    { name: 'DAA', path: '/daa', icon: PlaySquare },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full bg-bg-secondary border-r border-border-default flex flex-col relative z-40 shadow-[4px_0_24px_rgba(0,0,0,0.5)] font-sans"
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-8 bg-accent-tertiary border border-accent-tertiary rounded-full p-1.5 text-bg-primary hover:bg-accent-tertiary/80 transition-all z-30 shadow-[0_0_12px_rgba(255,224,74,0.6)]"
      >
        {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
      </button>

      <div className={`p-6 flex items-center justify-center gap-3 border-b border-border-default h-24`}>
        <div className="w-12 h-12 rounded bg-bg-elevated border border-accent-secondary flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,255,204,0.4)]">
          <Code2 size={28} className="text-accent-secondary" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.h1 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-2xl font-bold font-display text-text-primary tracking-tight whitespace-nowrap overflow-hidden"
            >
              Algo<span className="text-accent-secondary text-shadow-[0_0_8px_currentColor]">Next</span>
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      <nav 
        className="flex-1 p-4 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide"
        style={{ gap: '0.5rem', paddingTop: '2rem' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center rounded-lg transition-all duration-300 group relative ${
                isActive
                  ? 'text-accent-secondary'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
              }`
            }
            style={{ 
              padding: isCollapsed ? '0.75rem' : '0.75rem 0.75rem 0.75rem 2rem',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '1rem'
            }}
            title={isCollapsed ? item.name : undefined}
          >
            {({ isActive }) => (
              <>
                <div className={`shrink-0 flex items-center justify-center ${isCollapsed ? '' : 'w-8'}`}>
                  <item.icon size={32} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]' : 'group-hover:scale-110'}`} />
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`whitespace-nowrap font-mono text-base ${isActive ? 'text-text-primary text-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div 
        className="p-4 border-t border-border-default flex flex-col overflow-hidden"
        style={{ gap: '0.5rem' }}
      >
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center rounded-lg transition-all duration-300 group relative ${
              isActive
                ? 'text-accent-secondary'
                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
            }`
          }
          style={{ 
            padding: isCollapsed ? '0.75rem' : '0.75rem 0.75rem 0.75rem 2rem',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '1rem'
          }}
          title={isCollapsed ? "Profile" : undefined}
        >
          {({ isActive }) => (
            <>
              <div className={`shrink-0 flex items-center justify-center ${isCollapsed ? '' : 'w-8'}`}>
                <UserCircle size={32} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]' : 'group-hover:scale-110'}`} />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`whitespace-nowrap font-mono text-base ${isActive ? 'text-text-primary' : ''}`}
                  >
                    Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </NavLink>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center rounded-lg text-text-muted hover:bg-error/10 hover:text-error transition-all duration-300 group"
          style={{ 
            padding: isCollapsed ? '0.75rem' : '0.75rem 0.75rem 0.75rem 2rem',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '1rem'
          }}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <div className={`shrink-0 flex items-center justify-center ${isCollapsed ? '' : 'w-8'}`}>
            <LogOut size={32} className="group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,45,120,0.6)] transition-all duration-300" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap font-mono text-base"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

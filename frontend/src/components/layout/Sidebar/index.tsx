import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, UserCircle, Settings, LogOut, Code2, PlaySquare, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
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
    { name: 'Curriculum', path: '/curriculum', icon: BookOpen },
    { name: 'Visualizer', path: '/visualizer', icon: PlaySquare },
    { name: 'AI Tutor', path: '/ai-tutor', icon: Bot },
    { name: 'Faculty', path: '/faculty', icon: Settings },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full bg-bg-secondary border-r border-border-default flex flex-col relative z-20 shadow-xl"
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-bg-elevated border border-border-default rounded-full p-1 text-text-muted hover:text-accent-primary hover:border-accent-primary transition-colors z-30 shadow-md"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} border-b border-border-default h-20`}>
        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <Code2 size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.h1 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent tracking-tight whitespace-nowrap overflow-hidden"
            >
              AlgoNext
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-2 mt-2 whitespace-nowrap"
            >
              Learning
            </motion.div>
          )}
        </AnimatePresence>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-[inset_2px_0_0_var(--color-accent-primary)]'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
              }`
            }
            title={isCollapsed ? item.name : undefined}
          >
            <div className="shrink-0 flex items-center justify-center">
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-default space-y-2 overflow-hidden">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-200 group relative ${
              isActive
                ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-[inset_2px_0_0_var(--color-accent-primary)]'
                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
            }`
          }
          title={isCollapsed ? "Profile" : undefined}
        >
          <div className="shrink-0 flex items-center justify-center">
            <UserCircle size={20} className="group-hover:scale-110 transition-transform" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Profile
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 p-3 rounded-lg font-medium text-text-muted hover:bg-error/10 hover:text-error hover:border-error/20 border border-transparent transition-all duration-200 group"
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <div className="shrink-0 flex items-center justify-center">
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
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

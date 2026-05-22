import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, UserCircle, Settings, LogOut, Code2, PlaySquare, Bot } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

export function Sidebar() {
  const { signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Curriculum', path: '/curriculum', icon: BookOpen },
    { name: 'Visualizer', path: '/visualizer', icon: PlaySquare },
    { name: 'AI Tutor', path: '/ai-tutor', icon: Bot },
    { name: 'Faculty Admin', path: '/faculty', icon: Settings }, // Will be protected by role later
  ];

  return (
    <div className="w-64 h-full bg-bg-elevated border-r border-border-default flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-border-default">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <Code2 size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent tracking-tight">
          AlgoNext
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-2 mt-4">
          Learning
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-default space-y-2">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
            }`
          }
        >
          <UserCircle size={18} />
          Profile
        </NavLink>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-text-muted hover:bg-error/10 hover:text-error transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

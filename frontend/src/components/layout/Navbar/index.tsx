import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { useUser } from '@clerk/react';

export function Navbar() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) return null;

  return (
    <button 
      onClick={() => navigate('/profile')}
      className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-bg-elevated border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-all shadow-[0_0_12px_rgba(0,0,0,0.2)] group"
      title="Profile"
    >
      {user?.imageUrl ? (
        <img src={user.imageUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-border-default group-hover:border-accent-secondary transition-colors" />
      ) : (
        <UserCircle size={32} className="text-text-secondary group-hover:text-accent-secondary transition-colors" />
      )}
      <span className="font-mono font-bold text-base text-text-secondary group-hover:text-accent-secondary transition-colors pr-2">
        {user?.fullName || user?.username || 'Profile'}
      </span>
    </button>
  );
}

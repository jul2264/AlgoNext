import { UserCircle } from 'lucide-react';
import { useUser } from '@clerk/react';

export function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div 
      className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-bg-elevated border border-border-default shadow-[0_0_12px_rgba(0,0,0,0.2)]"
    >
      {user?.imageUrl ? (
        <img src={user.imageUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-transparent" />
      ) : (
        <UserCircle size={32} className="text-text-secondary" />
      )}
      <span className="font-mono font-bold text-base text-text-secondary pr-2">
        {user?.fullName || user?.username || 'Profile'}
      </span>
    </div>
  );
}

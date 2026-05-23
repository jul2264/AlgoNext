import { UserProfile } from '@clerk/react';

export function ProfilePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Account Settings</h1>
        <p className="text-text-secondary">Manage your profile and account preferences.</p>
      </div>
      
      <div className="w-full flex justify-center">
        <UserProfile />
      </div>
    </div>
  );
}

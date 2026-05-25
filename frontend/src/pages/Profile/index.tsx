import { UserProfile } from '@clerk/react';
import { PageHeader } from '@/components/layout/PageHeader';

export function ProfilePage() {
  return (
    <div 
      className="w-full mx-auto pb-10 min-h-[calc(100vh-4rem)] flex flex-col gap-4"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Account Settings</h1>
          <p className="text-text-secondary">Manage your profile and account preferences.</p>
        </div>
      </PageHeader>
      
      <div className="w-full flex justify-center mt-8">
        <UserProfile />
      </div>
    </div>
  );
}

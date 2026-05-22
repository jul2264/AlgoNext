import { UserProfile } from '@clerk/clerk-react';

export function ProfilePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Account Settings</h1>
        <p className="text-text-secondary">Manage your profile and account preferences.</p>
      </div>
      
      <div className="w-full flex justify-center">
        {/* We customize Clerk's UserProfile to match the dark theme */}
        <UserProfile 
          appearance={{
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#1a2332',
              colorText: '#f1f5f9',
              colorInputBackground: '#0a0e1a',
              colorInputText: '#f1f5f9',
              colorTextSecondary: '#94a3b8',
            },
            elements: {
              card: "shadow-none border border-border-default bg-bg-elevated",
              navbar: "border-border-default hidden sm:block",
              navbarMobileMenuButton: "text-text-primary",
              headerTitle: "text-text-primary",
              headerSubtitle: "text-text-secondary",
            }
          }}
        />
      </div>
    </div>
  );
}

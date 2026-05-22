import { useEffect } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { setupApiClient } from '@/services/api.client';

export function ProtectedRoute() {
  const { isLoaded, userId, getToken } = useAuth();

  useEffect(() => {
    // Setup the global API client to use the Clerk getToken function
    setupApiClient(getToken);
  }, [getToken]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="text-accent-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-primary">
      {/* Top Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-border-default px-6 bg-bg-elevated/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            AlgoNext
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

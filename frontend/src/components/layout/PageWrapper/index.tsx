import { useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { Navigate, Outlet } from 'react-router-dom';
import { setupApiClient } from '@/services/api.client';
import { Sidebar } from '../Sidebar';
import { Navbar } from '../Navbar';

export function ProtectedRoute() {
  const { isLoaded, userId, getToken } = useAuth();

  useEffect(() => {
    // Setup the global API client to use the Clerk getToken function
    setupApiClient(getToken);
  }, [getToken]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="text-accent-primary flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent" />
          <p className="font-medium">Loading AlgoNext...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

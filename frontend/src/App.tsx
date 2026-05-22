// AlgoNext — Root App Component with Router

import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from '@/pages/Auth';
import { ProtectedRoute } from '@/components/layout/PageWrapper';
import { ProblemPage } from '@/pages/Problem';

// Placeholder page components — will be replaced with real implementations
function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-4">
        Dashboard
      </h1>
      <p className="text-text-secondary">
        Welcome to AlgoNext. Your curriculum and progress will appear here.
      </p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-accent-primary mb-4">404</h1>
        <p className="text-text-secondary text-lg">Page not found</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/sign-in/*" element={<LoginPage />} />
      <Route path="/sign-up/*" element={<RegisterPage />} />
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/problems/:slug" element={<ProblemPage />} />
        {/* We will add /curriculum etc. here later */}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

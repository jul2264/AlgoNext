// AlgoNext — Root App Component with Router

import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from '@/pages/Auth';
import { ProtectedRoute } from '@/components/layout/PageWrapper';
import { DashboardPage } from '@/pages/Dashboard';
import { ProblemPage } from '@/pages/Problem';
import { VisualizerPage } from '@/pages/Visualizer';
import { CurriculumPage } from '@/pages/Curriculum';
import { FacultyPage } from '@/pages/Faculty';
import { ProfilePage } from '@/pages/Profile';
import { AiTutorPage } from '@/pages/AiTutor';

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
        <Route path="/curriculum" element={<CurriculumPage />} />
        <Route path="/problems/:slug" element={<ProblemPage />} />
        <Route path="/visualizer" element={<VisualizerPage />} />
        <Route path="/faculty" element={<FacultyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ai-tutor" element={<AiTutorPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// AlgoNext — Root App Component with Router

import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from '@/pages/Auth';
import { ProtectedRoute } from '@/components/layout/PageWrapper';
import { DashboardPage } from '@/pages/Dashboard';
import { ProblemPage } from '@/pages/Problem';
import { VisualizerPage } from '@/pages/Visualizer';
import { VisualizerInstancePage } from '@/pages/Visualizer/InstancePage';
import { CurriculumPage } from '@/pages/Curriculum';
import { ModulePage } from '@/pages/Curriculum/ModulePage';
import { TreesModulePage } from '@/pages/Curriculum/TreesModulePage';

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

import { PlaygroundPage } from '@/pages/Playground';

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
        <Route path="/dsa" element={<CurriculumPage />} />
        <Route path="/dsa/trees" element={<TreesModulePage />} />
        <Route path="/dsa/trees/:slug" element={<ModulePage />} />
        <Route path="/dsa/:slug" element={<ModulePage />} />
        <Route path="/problems/:slug" element={<ProblemPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/daa" element={<VisualizerPage />} />
        <Route path="/daa/:slug" element={<VisualizerInstancePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ai-tutor" element={<AiTutorPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

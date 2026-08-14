import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { WorkspacePreferencesProvider } from './hooks/useWorkspacePreferences';
import { UserRoleProvider } from './context/UserRoleContext';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Demands } from './pages/Demands';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Calendar } from './pages/Calendar';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <WorkspacePreferencesProvider>
        <UserRoleProvider>
        <HashRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated Layout with Sidebar & Topbar */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="demands" element={<Demands />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="team" element={<Team />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
        </UserRoleProvider>
      </WorkspacePreferencesProvider>
    </ThemeProvider>
  );
}

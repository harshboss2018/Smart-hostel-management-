import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import ManageWardens from './pages/admin/ManageWardens';
import SystemData from './pages/admin/SystemData';
import AdminNotices from './pages/admin/AdminNotices';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLostFound from './pages/admin/AdminLostFound';
import AdminFeedback from './pages/admin/AdminFeedback';

// Warden Pages
import WardenOverview from './pages/warden/WardenOverview';
import WardenComplaints from './pages/warden/WardenComplaints';
import WardenAnnouncements from './pages/warden/WardenAnnouncements';
import WardenStudents from './pages/warden/WardenStudents';
import WardenLeave from './pages/warden/WardenLeave';
import WardenLostFound from './pages/warden/WardenLostFound';
import WardenFeedback from './pages/warden/WardenFeedback';

// Student Pages
import StudentOverview from './pages/student/StudentOverview';
import StudentComplaints from './pages/student/StudentComplaints';
import StudentLostFound from './pages/student/StudentLostFound';
import StudentLeave from './pages/student/StudentLeave';
import StudentFeedback from './pages/student/StudentFeedback';

// Shared Pages
import StudentVoiceHub from './pages/shared/StudentVoiceHub';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="wardens" element={<ManageWardens />} />
          <Route path="data" element={<SystemData />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="lost-found" element={<AdminLostFound />} />
          <Route path="voice-hub" element={<StudentVoiceHub />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Warden Dashboard */}
        <Route path="/warden" element={
          <ProtectedRoute allowedRole="warden">
            <DashboardLayout role="warden" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<WardenOverview />} />
          <Route path="complaints" element={<WardenComplaints />} />
          <Route path="announcements" element={<WardenAnnouncements />} />

          <Route path="students" element={<WardenStudents />} />
          <Route path="leave" element={<WardenLeave />} />
          <Route path="lost-found" element={<WardenLostFound />} />
          <Route path="feedback" element={<WardenFeedback />} />
          <Route path="voice-hub" element={<StudentVoiceHub />} />
        </Route>

        {/* Student Dashboard */}
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<StudentOverview />} />
          <Route path="complaints" element={<StudentComplaints />} />
          <Route path="lostfound" element={<StudentLostFound />} />
          <Route path="leave" element={<StudentLeave />} />
          <Route path="feedback" element={<StudentFeedback />} />
          <Route path="voice-hub" element={<StudentVoiceHub />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import PortalLogin from '../pages/PortalLogin';

import AdminDashboard from '../pages/AdminDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import ParentDashboard from '../pages/ParentDashboard';
import LiveTracking from '../pages/LiveTracking';
import TotalStudents from '../pages/TotalStudents';
import ActiveDevices from '../pages/ActiveDevices';
import TodayAlerts from '../pages/TodayAlerts';
import EmergencyCalls from '../pages/EmergencyCalls';
import StudentProfile from '../pages/StudentProfile';
import LinkChild from '../pages/LinkChild';
import ParentChildView from '../pages/ParentChildView';

function DashboardRouter() {
  return (
    <Routes>
      <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="admin/students" element={<ProtectedRoute allowedRoles={['admin']}><TotalStudents /></ProtectedRoute>} />
      <Route path="admin/devices" element={<ProtectedRoute allowedRoles={['admin']}><ActiveDevices /></ProtectedRoute>} />
      <Route path="admin/alerts" element={<ProtectedRoute allowedRoles={['admin']}><TodayAlerts /></ProtectedRoute>} />
      <Route path="admin/emergencies" element={<ProtectedRoute allowedRoles={['admin']}><EmergencyCalls /></ProtectedRoute>} />
      <Route path="student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="admin" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<PortalLogin />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

          <Route path="/dashboard/*" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute allowedRoles={['admin', 'student', 'parent']}><LiveTracking /></ProtectedRoute>} />
          <Route path="/student/:id" element={<ProtectedRoute allowedRoles={['admin', 'parent']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/parent/link-child" element={<ProtectedRoute allowedRoles={['parent']}><LinkChild /></ProtectedRoute>} />
          <Route path="/parent/child/:childId" element={<ProtectedRoute allowedRoles={['parent']}><ParentChildView /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

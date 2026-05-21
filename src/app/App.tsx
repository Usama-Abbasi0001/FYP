import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';

// Dashboard Pages
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

// Dashboard Router Component
function DashboardRouter() {
  return (
    <Routes>
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="admin/students" element={<TotalStudents />} />
      <Route path="admin/devices" element={<ActiveDevices />} />
      <Route path="admin/alerts" element={<TodayAlerts />} />
      <Route path="admin/emergencies" element={<EmergencyCalls />} />
      <Route path="student" element={<StudentDashboard />} />
      <Route path="parent" element={<ParentDashboard />} />
      <Route path="*" element={<Navigate to="admin" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <LiveTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/:id"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/link-child"
            element={
              <ProtectedRoute>
                <LinkChild />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/child/:childId"
            element={
              <ProtectedRoute>
                <ParentChildView />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

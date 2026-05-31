import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps) {
  const { userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!userData) {
    const isStudentOrParentPath =
      location.pathname.includes('/dashboard/student') ||
      location.pathname.includes('/dashboard/parent') ||
      location.pathname.startsWith('/parent/');

    return (
      <Navigate to={isStudentOrParentPath ? '/portal' : '/login'} replace />
    );
  }

  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    if (userData.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (userData.role === 'student') return <Navigate to="/dashboard/student" replace />;
    if (userData.role === 'parent') return <Navigate to="/dashboard/parent" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

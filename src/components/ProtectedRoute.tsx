// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   allowedRoles?: string[];
// }

// export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
//   const { currentUser, userData } = useAuth();

//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <>{children}</>;
// }

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps) {

  const { currentUser, userData, loading } = useAuth();

  // ⏳ wait for auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // ❌ not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ❌ role check
  if (
    allowedRoles &&
    userData &&
    !allowedRoles.includes(userData.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ allow access
  return <>{children}</>;
}
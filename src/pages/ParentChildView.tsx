import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

export default function ParentChildView() {
  const { childId } = useParams<{ childId: string }>();
  const { userData, getUserById } = useAuth();
  const child = childId ? getUserById(childId) : undefined;

  const hasAccess = childId && userData?.parentOf?.includes(childId);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8">
        <Link to="/dashboard/parent" className="text-blue-400 hover:text-blue-300 text-sm">
          Back to parent dashboard
        </Link>

        {!hasAccess || !child ? (
          <p className="text-gray-400 mt-8">Child not found or access denied.</p>
        ) : (
          <div className="mt-6 max-w-lg rounded-xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-semibold text-white">{child.name}</h1>
            <div className="mt-4 space-y-2 text-gray-300 text-sm">
              <p><span className="text-gray-500">Seat:</span> {child.seatNumber ?? 'N/A'}</p>
              <p><span className="text-gray-500">Login ID:</span> {child.loginId}</p>
              <p><span className="text-gray-500">Phone:</span> {child.phone ?? 'N/A'}</p>
              <p className="text-gray-500 mt-4">Location and alerts use local demo data (no external database).</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

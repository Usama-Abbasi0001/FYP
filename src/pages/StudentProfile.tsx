import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const { getUserById } = useAuth();
  const student = id ? getUserById(id) : undefined;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8">
        <Link to="/dashboard/admin" className="text-blue-400 hover:text-blue-300 text-sm">
          Back to dashboard
        </Link>

        {!student || student.role !== 'student' ? (
          <p className="text-gray-400 mt-8">Student not found in local data.</p>
        ) : (
          <div className="mt-6 max-w-lg rounded-xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-semibold text-white">{student.name}</h1>
            <div className="mt-4 space-y-2 text-gray-300 text-sm">
              <p><span className="text-gray-500">Login ID:</span> {student.loginId}</p>
              <p><span className="text-gray-500">Seat Number:</span> {student.seatNumber ?? 'N/A'}</p>
              <p><span className="text-gray-500">Phone:</span> {student.phone ?? 'N/A'}</p>
              <p><span className="text-gray-500">Parent:</span> {student.parentName ?? 'N/A'}</p>
              <p><span className="text-gray-500">Created:</span> {new Date(student.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

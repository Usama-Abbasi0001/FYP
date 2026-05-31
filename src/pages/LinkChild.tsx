import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

export default function LinkChild() {
  const { userData, managedUsers, linkChildToParent } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const id = studentId.trim();
    const student = managedUsers.find((u) => u.id === id || u.loginId === id);

    if (!student) {
      setMessage({ type: 'error', text: 'Student not found. Use student ID or login ID from admin.' });
      setLoading(false);
      return;
    }

    if (student.role !== 'student') {
      setMessage({ type: 'error', text: 'This ID does not belong to a student.' });
      setLoading(false);
      return;
    }

    if (userData?.parentOf?.includes(student.id)) {
      setMessage({ type: 'error', text: 'This student is already linked.' });
      setLoading(false);
      return;
    }

    if (userData?.id) {
      linkChildToParent(userData.id, student.id);
      setMessage({ type: 'success', text: `Successfully linked ${student.name}!` });
      setStudentId('');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8">
        <Link to="/dashboard/parent" className="text-blue-400 hover:text-blue-300 text-sm">
          Back to parent dashboard
        </Link>

        <h1 className="text-2xl text-white mt-4 mb-6">Link Child</h1>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Student ID or Login ID (e.g. STU-101)"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white"
          />
          <button
            type="submit"
            disabled={!studentId.trim() || loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white disabled:opacity-50"
          >
            {loading ? 'Linking...' : 'Link Child'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </main>
    </div>
  );
}

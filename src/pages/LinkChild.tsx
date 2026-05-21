import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export default function LinkChild() {
  const { userData, currentUser } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<{ id: string; name: string }[]>([]);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) return;

    setLoading(true);
    setMessage(null);

    try {
      console.log('LinkChild debug:', {
        projectId: (db as any)?._databaseId || 'unknown',
        currentUid: currentUser.uid,
        userData,
        studentId: studentId.trim(),
      });

      const studentRef = doc(db, 'users', studentId.trim());
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        setMessage({ type: 'error', text: 'Student not found. Please check the Student ID.' });
        setLoading(false);
        return;
      }

      const studentData = studentSnap.data();
      console.log('LinkChild: studentData.role =', (studentData as any).role);
      if (studentData.role !== 'student') {
        setMessage({ type: 'error', text: 'This ID does not belong to a student account.' });
        setLoading(false);
        return;
      }

      // Check if already linked
      if (userData.parentOf?.includes(studentId.trim())) {
        setMessage({ type: 'error', text: 'This student is already linked to your account.' });
        setLoading(false);
        return;
      }

      // Link child to parent
      console.log('LinkChild: updating parent doc:', currentUser.uid);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        parentOf: arrayUnion(studentId.trim())
      });
      console.log('LinkChild: updateDoc succeeded');

      setMessage({
        type: 'success',
        text: `Successfully linked ${studentData.name || 'Student'} to your account!`
      });
      setStudentId('');
      setLinkedChildren([
        ...linkedChildren,
        { id: studentId.trim(), name: studentData.name || 'Unknown' }
      ]);
    } catch (error: any) {
      console.error('LinkChild error:', error);
      const msg = error?.code === 'permission-denied' || (error?.message || '').toLowerCase().includes('missing or insufficient')
        ? 'Missing or insufficient permissions. Please ensure Firestore rules allow you to link children (see project firestore.rules).'
        : error.message || 'Failed to link child. Please try again.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <div className="mx-auto max-w-2xl px-6 py-8 sm:px-8">
        <Link
          to="/dashboard/parent"
          className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-200 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to parent dashboard
        </Link>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-black/20">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2">Link Your Child</h1>
            <p className="text-gray-400">
              Enter your child's Student ID to link them to your account. You'll then be able to monitor their safety,
              location, and alerts.
            </p>
          </div>

          <form onSubmit={handleLinkChild} className="space-y-6 mb-8">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-white mb-2">
                Student ID
              </label>
              <input
                id="studentId"
                type="text"
                placeholder="e.g., STU2023001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950/50 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
              />
              <p className="mt-2 text-sm text-gray-400">
                You can find your child's Student ID on their school documents or ask the school administration.
              </p>
            </div>

            <button
              type="submit"
              disabled={!studentId.trim() || loading}
              className="w-full rounded-2xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Link Child
                </>
              )}
            </button>
          </form>

          {message && (
            <div
              className={`rounded-2xl border p-4 flex items-start gap-3 ${
                message.type === 'success'
                  ? 'border-green-500/30 bg-green-500/10'
                  : 'border-red-500/30 bg-red-500/10'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
                {message.text}
              </p>
            </div>
          )}

          {(userData?.parentOf?.length ?? 0) > 0 && (
            <div className="mt-8 pt-8 border-t border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Linked Children</h2>
              <div className="space-y-3">
                {userData?.parentOf?.map((childId) => (
                  <Link
                    key={childId}
                    to={`/parent/child/${childId}`}
                    className="block rounded-2xl border border-white/10 bg-slate-950/50 p-4 hover:border-white/20 transition"
                  >
                    <p className="text-white font-medium">Student ID: {childId}</p>
                    <p className="text-sm text-gray-400 mt-1">Click to view details and monitor</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

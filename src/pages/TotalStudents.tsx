import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, ArrowLeft, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface StudentItem {
  id: string;
  name: string;
  rollNumber?: string;
  grade?: string;
  section?: string;
  email?: string;
  deviceStatus?: string;
  lastSeen?: string;
  photoUrl?: string;
}

export default function TotalStudents() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    setLoading(true);
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));

    const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      const studentsList: StudentItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? data.fullName ?? 'Unknown Student',
          rollNumber: data.rollNumber ?? data.studentId ?? undefined,
          grade: data.grade ?? data.class ?? undefined,
          section: data.section ?? undefined,
          email: data.email ?? undefined,
          deviceStatus: data.deviceStatus ?? data.status ?? 'offline',
          lastSeen: data.lastSeen ?? undefined,
          photoUrl: data.photoUrl ?? undefined
        };
      });

      setStudents(studentsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter === 'online') {
      filtered = filtered.filter((student) => student.deviceStatus?.toLowerCase() === 'connected' || student.deviceStatus?.toLowerCase() === 'online');
    } else if (statusFilter === 'offline') {
      filtered = filtered.filter((student) => student.deviceStatus?.toLowerCase() === 'disconnected' || student.deviceStatus?.toLowerCase() === 'offline');
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <div className="mb-8">
          <Link
            to="/dashboard/admin"
            className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-200 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to admin dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-white mb-2">Total Students</h1>
          <p className="text-gray-400">
            Manage and view student profiles. Click on any student to see their detailed profile, location, and alert history.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full bg-white/10 border border-white/20 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'online', 'offline'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === filter
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'online' ? 'Online' : 'Offline'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-gray-400">
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <p className="text-gray-400">
              {students.length === 0 ? 'No students found' : 'No students match your search'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4 px-4">
              <div className="col-span-4">Student</div>
              <div className="col-span-2">Roll Number</div>
              <div className="col-span-2">Grade</div>
              <div className="col-span-2">Device Status</div>
              <div className="col-span-2">Last Seen</div>
            </div>

            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/student/${student.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-white/20"
                >
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-slate-200">{student.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.email ?? 'No email'}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-300">{student.rollNumber ?? 'N/A'}</div>
                    <div className="col-span-2 text-sm text-gray-300">
                      {student.grade}
                      {student.section ? ` - ${student.section}` : ''}
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                          student.deviceStatus?.toLowerCase() === 'connected' ||
                          student.deviceStatus?.toLowerCase() === 'online'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {student.deviceStatus?.toLowerCase() === 'connected' ||
                        student.deviceStatus?.toLowerCase() === 'online' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {student.deviceStatus ?? 'Unknown'}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-400">{student.lastSeen ?? 'Never'}</div>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-slate-200">{student.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{student.name}</p>
                        <p className="text-xs text-gray-400 truncate">{student.rollNumber ?? 'N/A'}</p>
                      </div>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        student.deviceStatus?.toLowerCase() === 'connected' ||
                        student.deviceStatus?.toLowerCase() === 'online'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {student.deviceStatus?.toLowerCase() === 'connected' ||
                      student.deviceStatus?.toLowerCase() === 'online' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}

            <div className="mt-4 text-center text-sm text-gray-400">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

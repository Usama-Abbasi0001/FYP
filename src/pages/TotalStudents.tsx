import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function TotalStudents() {
  const { managedUsers } = useAuth();
  const students = managedUsers.filter((u) => u.role === 'student');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.seatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.loginId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a] p-6 sm:p-8">
      <Link to="/dashboard/admin" className="mb-6 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin Dashboard
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-semibold text-white">Total Students</h1>
          <p className="text-gray-400">{students.length} students (local memory)</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, seat, or login ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <p className="text-gray-400">No students found. Create students from the admin dashboard.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <p className="font-semibold text-white">{student.name}</p>
              <p className="text-sm text-gray-400 mt-1">Seat: {student.seatNumber ?? 'N/A'}</p>
              <p className="text-sm text-gray-400">Login ID: {student.loginId}</p>
              <p className="text-sm text-gray-400">Parent: {student.parentName ?? 'N/A'}</p>
              <Link to={`/student/${student.id}`} className="mt-3 inline-block text-sm text-blue-400">
                View profile
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

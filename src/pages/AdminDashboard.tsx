import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import {
  Users,
  Shield,
  AlertTriangle,
  Activity,
  UserPlus,
  Copy,
  CheckCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth, CreatedUserCredentials } from '../contexts/AuthContext';

type Tab = 'parent' | 'student';

function CredentialsModal({
  credentials,
  onClose
}: {
  credentials: CreatedUserCredentials;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const portalUrl = `${window.location.origin}/portal`;
  const details = `Role: ${credentials.role}
Name: ${credentials.name}
Login ID: ${credentials.loginId}
Password: ${credentials.password}
Portal: ${portalUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-[#0f1f35] p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">User Created</h3>
        </div>
        <div className="space-y-2 rounded-xl bg-white/5 p-4 text-sm text-gray-300">
          <p><span className="text-gray-500">Login ID:</span> <span className="font-mono text-emerald-300">{credentials.loginId}</span></p>
          <p><span className="text-gray-500">Password:</span> <span className="font-mono text-emerald-300">{credentials.password}</span></p>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(details);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { managedUsers, createParentUser, createStudentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('parent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<CreatedUserCredentials | null>(null);

  const students = managedUsers.filter((u) => u.role === 'student');
  const parents = managedUsers.filter((u) => u.role === 'parent');

  const parentForm = useFormik({
    initialValues: { name: '', nic: '', address: '', phone: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      nic: Yup.string().required('Required'),
      address: Yup.string().required('Required'),
      phone: Yup.string().required('Required')
    }),
    onSubmit: (values, { resetForm }) => {
      try {
        setLoading(true);
        setError('');
        setCredentials(createParentUser(values));
        resetForm();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  });

  const studentForm = useFormik({
    initialValues: { name: '', seatNumber: '', parentId: '', parentName: '', phone: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      seatNumber: Yup.string().required('Required'),
      parentName: Yup.string().required('Required'),
      phone: Yup.string().required('Required')
    }),
    onSubmit: (values, { resetForm }) => {
      try {
        setLoading(true);
        setError('');
        setCredentials(
          createStudentUser({
            name: values.name,
            seatNumber: values.seatNumber,
            parentName: values.parentName,
            parentId: values.parentId || undefined,
            phone: values.phone
          })
        );
        resetForm();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Local in-memory campus safety management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} label="Total Students" value={students.length} change="Live count" changeType="positive" color="blue" />
            <StatCard icon={Users} label="Total Parents" value={parents.length} change="Live count" changeType="positive" color="green" />
            <StatCard icon={Shield} label="Managed Users" value={managedUsers.length} change="In memory" changeType="positive" color="purple" />
            <StatCard icon={Activity} label="System Mode" value="Local" change="No Firebase" changeType="positive" color="orange" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg"
          >
            <h3 className="text-white mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-400" />
              Create User
            </h3>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('parent')}
                className={`rounded-lg px-4 py-2 text-sm ${activeTab === 'parent' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`rounded-lg px-4 py-2 text-sm ${activeTab === 'student' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}
              >
                Student
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            {activeTab === 'parent' ? (
              <form onSubmit={parentForm.handleSubmit} className="grid gap-3 sm:grid-cols-2">
                <input {...parentForm.getFieldProps('name')} placeholder="Parent Name" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" />
                <input {...parentForm.getFieldProps('nic')} placeholder="NIC Number" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" />
                <input {...parentForm.getFieldProps('phone')} placeholder="Phone" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" />
                <input {...parentForm.getFieldProps('address')} placeholder="Address" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white sm:col-span-2" />
                <button type="submit" disabled={loading} className="sm:col-span-2 rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-500 disabled:opacity-60">
                  {loading ? 'Creating...' : 'Create Parent'}
                </button>
              </form>
            ) : (
              <form onSubmit={studentForm.handleSubmit} className="grid gap-3 sm:grid-cols-2">
                <input {...studentForm.getFieldProps('name')} placeholder="Student Name" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" />
                <input {...studentForm.getFieldProps('seatNumber')} placeholder="Seat Number" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" />
                <input {...studentForm.getFieldProps('parentName')} placeholder="Parent Name" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" />
                <input {...studentForm.getFieldProps('phone')} placeholder="Phone" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" />
                {parents.length > 0 && (
                  <select
                    value={studentForm.values.parentId}
                    onChange={(e) => {
                      const id = e.target.value;
                      studentForm.setFieldValue('parentId', id);
                      const parent = parents.find((p) => p.id === id);
                      if (parent) studentForm.setFieldValue('parentName', parent.name);
                    }}
                    className="rounded-lg border border-white/10 bg-[#152238] px-4 py-3 text-white sm:col-span-2"
                  >
                    <option value="">Link to existing parent (optional)</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.loginId})</option>
                    ))}
                  </select>
                )}
                <button type="submit" disabled={loading} className="sm:col-span-2 rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-500 disabled:opacity-60">
                  {loading ? 'Creating...' : 'Create Student'}
                </button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg"
          >
            <h3 className="text-white mb-4">All Created Users ({managedUsers.length})</h3>

            {managedUsers.length === 0 ? (
              <p className="text-gray-400 text-sm">No users yet. Create a parent or student above.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {managedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl border border-white/10 bg-[#0a1628]/60 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${user.role === 'student' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {user.role}
                      </span>
                      <span className="font-mono text-xs text-gray-500">{user.loginId}</span>
                    </div>
                    <p className="text-white font-medium">{user.name}</p>
                    {user.phone && <p className="text-sm text-gray-400 mt-1">Phone: {user.phone}</p>}
                    {user.seatNumber && <p className="text-sm text-gray-400">Seat: {user.seatNumber}</p>}
                    {user.nic && <p className="text-sm text-gray-400">NIC: {user.nic}</p>}
                    {user.address && <p className="text-sm text-gray-400 truncate">Address: {user.address}</p>}
                    {user.parentName && <p className="text-sm text-gray-400">Parent: {user.parentName}</p>}
                    <p className="text-xs text-gray-500 mt-2">Created: {new Date(user.createdAt).toLocaleString()}</p>
                    {user.role === 'student' && (
                      <Link to={`/student/${user.id}`} className="mt-3 inline-block text-sm text-blue-400 hover:text-blue-300">
                        View profile
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {credentials && (
        <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
      )}
    </div>
  );
}

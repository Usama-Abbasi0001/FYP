import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User, Lock, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PortalLogin() {
  const navigate = useNavigate();
  const { portalLogin } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { loginId: '', password: '' },
    validationSchema: Yup.object({
      loginId: Yup.string().required('Login ID required'),
      password: Yup.string().required('Password required')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        const user = await portalLogin(values.loginId, values.password);
        navigate(user.role === 'student' ? '/dashboard/student' : '/dashboard/parent');
      } catch (err) {
        setError((err as Error).message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl mb-4 backdrop-blur-sm border border-emerald-500/30">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-white mb-2">Campus Safety Portal</h1>
          <p className="text-gray-400">Student &amp; Parent Access (Local)</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 mb-2">Login ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...formik.getFieldProps('loginId')}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white uppercase"
                  placeholder="STU-101 or PAR-NIC"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  {...formik.getFieldProps('password')}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Administrator?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}

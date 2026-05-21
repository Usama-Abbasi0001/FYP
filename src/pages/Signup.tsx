import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
  Shield,
  User,
  Users,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

export default function Signup() {

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugError, setDebugError] = useState('');

  const [selectedRole, setSelectedRole] = useState('student');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup } = useAuth();

  const formik = useFormik({

    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'student',
      studentId: ''
    },

    validationSchema: Yup.object({

      name: Yup.string().required('Name is required'),

      email: Yup.string()
        .email('Invalid Email')
        .required('Email is required'),

      password: Yup.string()
        .min(6, 'Minimum 6 characters')
        .required('Password is required'),

      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password required'),

      phone: Yup.string().required('Phone required'),

      role: Yup.string().required('Please select a role'),

      studentId: Yup.string().when('role', {
        is: 'student',
        then: (schema) => schema.required('Student ID required'),
        otherwise: (schema) => schema.notRequired()
      })
    }),

    onSubmit: async (values) => {

      try {

        setLoading(true);
        setError('');
        setDebugError('');

        console.log('Signup values:', values, 'selectedRole:', selectedRole);

        const role = values.role || selectedRole;

        await signup(values.email, values.password, role, {
          name: values.name,
          phone: values.phone,
          studentId: role === 'student' ? values.studentId : ''
        });

        navigate('/login');

      } catch (err: any) {

        console.error('Signup error object:', err);

        const code = err?.code || 'unknown_error';
        const message = err?.message || 'Something went wrong';

        setError(`${code}: ${message}`);
        setDebugError(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

      } finally {
        setLoading(false);
      }
    }
  });

  const roles = [
    { value: 'student', label: 'Student', icon: User },
    { value: 'parent', label: 'Parent', icon: Users },
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'admin', label: 'Admin', icon: Shield }
  ];

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#0a1628] px-4 py-8 overflow-hidden relative">

      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-400/20 blur-3xl rounded-full"></div>

      <div className="relative w-full max-w-2xl">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-5 sm:p-8">

          <div className="text-center mb-8">

            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Create Account
            </h1>

            <p className="text-gray-300 mt-2 text-sm sm:text-base">
              Smart Campus Safety System
            </p>

          </div>

          {error && (
            <div className="mb-5 flex flex-col gap-2 text-red-300 bg-red-500/10 border border-red-500/30 backdrop-blur-lg p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <span className="text-sm font-semibold">{error}</span>
              </div>
              {debugError && (
                <pre className="text-xs text-gray-200 overflow-x-auto whitespace-pre-wrap bg-black/10 p-2 rounded-md border border-white/10">
                  {debugError}
                </pre>
              )}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">

            <input type="hidden" {...formik.getFieldProps('role')} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {roles.map((r) => {

                const Icon = r.icon;

                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.value);
                      formik.setFieldValue('role', r.value);
                    }}
                    className={`group relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                      selectedRole === r.value
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >

                    <Icon size={22} />

                    <span className="text-sm font-medium">
                      {r.label}
                    </span>

                  </button>
                );
              })}
            </div>

            <div className="grid gap-5">

              <div>
                <input
                  type="text"
                  className={`w-full bg-white/10 border p-3 rounded-xl text-white transition ${formik.touched.name && formik.errors.name ? 'border-red-400' : 'border-white/10'}`}
                  {...formik.getFieldProps('name')}
                  placeholder="Name"
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="text-sm text-red-300 mt-2">{formik.errors.name}</p>
                ) : null}
              </div>

              <div>
                <input
                  type="email"
                  className={`w-full bg-white/10 border p-3 rounded-xl text-white transition ${formik.touched.email && formik.errors.email ? 'border-red-400' : 'border-white/10'}`}
                  {...formik.getFieldProps('email')}
                  placeholder="Email"
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-sm text-red-300 mt-2">{formik.errors.email}</p>
                ) : null}
              </div>

              <div>
                <input
                  type="text"
                  className={`w-full bg-white/10 border p-3 rounded-xl text-white transition ${formik.touched.phone && formik.errors.phone ? 'border-red-400' : 'border-white/10'}`}
                  {...formik.getFieldProps('phone')}
                  placeholder="Phone"
                />
                {formik.touched.phone && formik.errors.phone ? (
                  <p className="text-sm text-red-300 mt-2">{formik.errors.phone}</p>
                ) : null}
              </div>

              {selectedRole === "student" && (
                <div>
                  <input
                    type="text"
                    className={`w-full bg-white/10 border p-3 rounded-xl text-white transition ${formik.touched.studentId && formik.errors.studentId ? 'border-red-400' : 'border-white/10'}`}
                    {...formik.getFieldProps('studentId')}
                    placeholder="Student ID"
                  />
                  {formik.touched.studentId && formik.errors.studentId ? (
                    <p className="text-sm text-red-300 mt-2">{formik.errors.studentId}</p>
                  ) : null}
                </div>
              )}

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-white/10 border p-3 rounded-xl text-white transition ${formik.touched.password && formik.errors.password ? 'border-red-400' : 'border-white/10'}`}
                  {...formik.getFieldProps('password')}
                  placeholder="Password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

                {formik.touched.password && formik.errors.password ? (
                  <p className="text-sm text-red-300 mt-2">{formik.errors.password}</p>
                ) : null}

              </div>

              <div className="relative">

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full bg-white/10 border p-3 rounded-xl text-white transition ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-400' : 'border-white/10'}`}
                  {...formik.getFieldProps('confirmPassword')}
                  placeholder="Confirm Password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                >
                  {showConfirmPassword
                    ? <EyeOff size={20} />
                    : <Eye size={20} />}
                </button>

                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <p className="text-sm text-red-300 mt-2">{formik.errors.confirmPassword}</p>
                ) : null}

              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-[#0a1628] font-bold py-3 rounded-2xl"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-sm mt-6 text-gray-300">
            Already have account?{" "}
            <Link
              to="/login"
              className="text-cyan-300"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
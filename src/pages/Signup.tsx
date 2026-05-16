import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Shield, User, Users, AlertCircle } from 'lucide-react';

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

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
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().min(8).required(),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')])
        .required(),
      phone: Yup.string().required(),
      studentId: Yup.string().when('role', {
        is: 'student',
        then: (schema) => schema.required(),
        otherwise: (schema) => schema
      })
    }),

    onSubmit: async (values) => {
      try {
        setError('');
        setLoading(true);

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: selectedRole,
          studentId: selectedRole === 'student' ? values.studentId : "",
          createdAt: serverTimestamp()
        });

        navigate('/login');

      } catch (err: any) {
        console.log(err);

        switch (err.code) {
          case "auth/email-already-in-use":
            setError("Email already in use");
            break;
          case "auth/invalid-email":
            setError("Invalid email");
            break;
          case "auth/weak-password":
            setError("Weak password (min 6 chars)");
            break;
          default:
            setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const roles = [
    { value: 'student', label: 'Student', icon: User },
    { value: 'parent', label: 'Parent', icon: Users },
    { value: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-xl p-8 bg-white rounded-2xl shadow-xl border">

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create Account
        </h1>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">

          {/* Roles */}
          <div className="grid grid-cols-3 gap-3 mb-4">
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
                  className={`flex flex-col items-center justify-center gap-1 p-4 rounded-xl border transition-all duration-200 ${
                    selectedRole === r.value
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fields (Row Style) */}

          <div className="grid gap-3">

            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-600">Name</label>
              <input
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                {...formik.getFieldProps('name')}
                placeholder="Enter name"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-600">Email</label>
              <input
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                {...formik.getFieldProps('email')}
                placeholder="Enter email"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-600">Phone</label>
              <input
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                {...formik.getFieldProps('phone')}
                placeholder="Enter phone"
              />
            </div>

            {selectedRole === 'student' && (
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-600">Student ID</label>
                <input
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  {...formik.getFieldProps('studentId')}
                  placeholder="Enter student ID"
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-600">Password</label>
              <input
                type="password"
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                {...formik.getFieldProps('password')}
                placeholder="Enter password"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-gray-600">Confirm</label>
              <input
                type="password"
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                {...formik.getFieldProps('confirmPassword')}
                placeholder="Confirm password"
              />
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        <p className="text-center text-sm mt-4 text-gray-600">
          Already have account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
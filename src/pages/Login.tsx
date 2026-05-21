import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';

import * as Yup from 'yup';

import {
  Shield,
  Mail,
  Lock,
  AlertCircle
} from 'lucide-react';

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth, db } from "../config/firebase";

import { doc, getDoc } from "firebase/firestore";

export default function Login() {

  const navigate = useNavigate();

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const formik = useFormik({

    initialValues: {
      email: '',
      password: ''
    },

    validationSchema: Yup.object({

      email: Yup.string()
        .email('Invalid email')
        .required('Email required'),

      password: Yup.string()
        .required('Password required')

    }),

    onSubmit: async (values) => {

      try {

        setLoading(true);
        setError('');

        // 1️⃣ LOGIN USER
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        const user = userCredential.user;

        // 2️⃣ FIRESTORE USER DATA FETCH
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("User data not found in database");
          return;
        }

        const userData = docSnap.data();

        // 3️⃣ ROLE BASED REDIRECT
        if (userData.role === "student") {
          navigate("/dashboard/student");
        }
        else if (userData.role === "parent") {
          navigate("/dashboard/parent");
        }
        else if (userData.role === "admin") {
          navigate("/dashboard/admin");
        }
        else if (userData.role === "security") {
          navigate("/dashboard/admin");
        }
        else {
          navigate("/dashboard");
        }

      } catch (err: any) {

        console.log(err);

        switch (err.code) {

          case "auth/user-not-found":
            setError("User not found");
            break;

          case "auth/wrong-password":
            setError("Wrong password");
            break;

          case "auth/invalid-credential":
            setError("Invalid email or password");
            break;

          default:
            setError("Login failed");
        }

      } finally {
        setLoading(false);
      }
    }
  });

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#1a2f4a] flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4 backdrop-blur-sm border border-blue-500/30">

            <Shield className="w-8 h-8 text-blue-400" />

          </div>

          <h1 className="text-white mb-2">
            Smart Campus Safety
          </h1>

          <p className="text-gray-400">
            Secure Login Portal
          </p>

        </div>

        {/* CARD */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">

          <h2 className="text-white mb-6 text-center">
            Sign In
          </h2>

          {/* ERROR */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">

              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />

              <p className="text-red-400">{error}</p>

            </div>
          )}

          {/* FORM */}
          <form onSubmit={formik.handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>

              <label className="block text-gray-300 mb-2">
                Email Address
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="email"
                  {...formik.getFieldProps('email')}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Enter your email"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-gray-300 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  {...formik.getFieldProps('password')}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Enter your password"
                />

              </div>

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center">

            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-400"
              >
                Sign Up
              </Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}
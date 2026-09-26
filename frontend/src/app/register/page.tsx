'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { UserPlus, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('/auth/admin-exists');
        setAdminExists(res.data.admin_exists);
      } catch {
        setAdminExists(false);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim(),
        password: password,
        role: 'admin'
      });

      setSuccess(true);

      setTimeout(() => {
        login(response.data.access_token, response.data.user);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  // Loading state
  if (adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Admin already exists — block registration
  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-surface rounded-xl shadow-md border border-border-main p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-status-error-soft text-status-error mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-fraunces font-bold text-text-primary mb-2">Registration Closed</h1>
          <p className="text-text-secondary text-sm mb-6">
            An administrator account already exists for this clinic. Contact your admin to get staff access credentials.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-md border border-border-main p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-soft text-primary mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-fraunces font-bold text-primary mb-1">PhysioDesk</h1>
          <h2 className="text-xl font-semibold text-text-primary">Set Up Admin Account</h2>
          <p className="text-sm text-text-secondary mt-1">
            Create the administrator account for your clinic
          </p>
        </div>

        {error && (
          <div className="bg-status-error-soft text-status-error p-3 rounded-md mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-status-success-soft text-status-success p-4 rounded-md mb-6 text-sm flex items-center gap-2 justify-center">
            <CheckCircle2 className="w-5 h-5" />
            <span>Admin account created! Logging you in...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading || success}
              className="w-full px-4 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:opacity-50"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Phone Number <span className="text-text-secondary text-xs font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading || success}
              className="w-full px-4 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:opacity-50"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || success}
              className="w-full px-4 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:opacity-50"
              placeholder="admin@physiodesk.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || success}
              minLength={6}
              className="w-full px-4 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:opacity-50"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || success}
              minLength={6}
              className="w-full px-4 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:opacity-50"
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary text-surface py-2.5 px-4 rounded-lg hover:opacity-90 focus:ring-4 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm cursor-pointer mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Already have an account? Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

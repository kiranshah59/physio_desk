'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
      
      // Auto login with the returned token
      setTimeout(() => {
        login(response.data.access_token, response.data.user);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-md border border-border-main p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-soft text-primary mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-fraunces font-bold text-primary mb-1">PhysioDesk</h1>
          <h2 className="text-xl font-semibold text-text-primary">Create an Account</h2>
          <p className="text-sm text-text-secondary mt-1">
            Sign up to manage your clinic
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
            <span>Account created! Logging you in...</span>
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
              Phone Number
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-main text-center">
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

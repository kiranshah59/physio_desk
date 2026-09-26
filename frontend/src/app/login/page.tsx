'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('/auth/admin-exists');
        setAdminExists(res.data.admin_exists);
      } catch {
        setAdminExists(true);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      login(response.data.access_token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-md border border-border-main p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-fraunces font-bold text-primary mb-2">PhysioDesk</h1>
          <p className="text-text-secondary">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-status-error-soft text-status-error p-3 rounded-md mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              placeholder="admin@physiodesk.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-11 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-surface py-2.5 px-4 rounded-lg hover:opacity-90 focus:ring-4 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {!adminExists && (
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary mb-2">
              No admin account yet?
            </p>
            <Link
              href="/register"
              className="inline-block text-sm font-semibold text-primary hover:text-primary-text-soft transition-colors hover:underline"
            >
              Set Up Admin Account &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  KeyRound, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  X, 
  Search, 
  Eye, 
  EyeOff, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface UserItem {
  id: number;
  email: string;
  role: 'admin' | 'staff';
  created_at?: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'staff' | 'admin'>('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<UserItem | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetModalError, setResetModalError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      showNotification('error', 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleOpenAddModal = () => {
    setNewEmail('');
    setNewPassword(generateRandomPassword());
    setNewRole('staff');
    setModalError('');
    setShowPassword(true);
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!newEmail.trim()) {
      setModalError('Email is required.');
      return;
    }
    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users', {
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
      });

      showNotification('success', `Staff account for ${newEmail} created successfully.`);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResetModal = (target: UserItem) => {
    setResetTargetUser(target);
    setResetNewPassword(generateRandomPassword());
    setResetModalError('');
    setShowResetPassword(true);
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetModalError('');

    if (resetNewPassword.length < 6) {
      setResetModalError('Password must be at least 6 characters long.');
      return;
    }

    setResetSubmitting(true);
    try {
      await api.put(`/users/${resetTargetUser.id}`, {
        password: resetNewPassword,
      });

      showNotification('success', `Password for ${resetTargetUser.email} updated successfully.`);
      setIsResetModalOpen(false);
    } catch (err: any) {
      setResetModalError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleDeleteUser = async (target: UserItem) => {
    if (target.id === user?.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to revoke access and delete account: ${target.email}?`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${target.id}`);
      showNotification('success', `Account ${target.email} has been deleted.`);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err: any) {
      showNotification('error', err.response?.data?.detail || 'Failed to delete user account.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-status-success-soft text-status-success border border-status-success/20'
              : 'bg-status-error-soft text-status-error border border-status-error/20'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-fraunces text-text-primary">Staff & User Access</h1>
          <p className="text-text-secondary text-sm">
            Create and manage staff logins, credentials, and clinic access permissions
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-primary text-surface px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-soft text-primary rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Accounts</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-secondary-light/10 text-secondary rounded-lg">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Administrators</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{adminCount}</p>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-tertiary-soft text-tertiary rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Staff Members</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{staffCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search accounts by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-main border border-border-main rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-text-secondary">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 bg-bg-main border border-border-main rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles ({totalUsers})</option>
            <option value="staff">Staff Only ({staffCount})</option>
            <option value="admin">Admins Only ({adminCount})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-secondary">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
            <p>Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <Users className="w-12 h-12 mx-auto text-text-secondary/40 mb-3" />
            <p className="font-medium text-text-primary">No user accounts found</p>
            <p className="text-sm mt-1">Try adjusting your search filter or add a new staff member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main/60 border-b border-border-main text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="py-3.5 px-6">User / Email</th>
                  <th className="py-3.5 px-6">Role & Access</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-sm">
                {filteredUsers.map((u) => {
                  const isCurrentLoggedInUser = u.id === user?.id;

                  return (
                    <tr key={u.id} className="hover:bg-bg-main/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs ${
                              u.role === 'admin'
                                ? 'bg-primary text-surface'
                                : 'bg-tertiary-soft text-tertiary'
                            }`}
                          >
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-text-primary flex items-center gap-2">
                              <span>{u.email}</span>
                              {isCurrentLoggedInUser && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-text-secondary">ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary-text-soft border border-primary/20">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Administrator (Full Access)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-soft text-tertiary border border-tertiary/20">
                            <UserCheck className="w-3.5 h-3.5" />
                            Staff (Restricted)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-text-secondary text-xs">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Initial Seed'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenResetModal(u)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary-soft/50 rounded-md transition-colors"
                            title="Reset User Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrentLoggedInUser}
                            className={`p-1.5 rounded-md transition-colors ${
                              isCurrentLoggedInUser
                                ? 'text-text-secondary/30 cursor-not-allowed'
                                : 'text-text-secondary hover:text-status-error hover:bg-status-error-soft'
                            }`}
                            title={isCurrentLoggedInUser ? 'Cannot delete current logged-in user' : 'Revoke Access / Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff / User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6 border border-border-main animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border-main mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-soft text-primary rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Create Staff Member</h3>
                  <p className="text-xs text-text-secondary">Generate login ID and password for staff</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="bg-status-error-soft text-status-error p-3 rounded-lg text-sm mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Staff Email / ID
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="staff.member@physiodesk.com"
                  className="w-full px-3.5 py-2 bg-surface text-text-primary border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-text-secondary uppercase">
                    Initial Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface text-text-primary border border-border-main rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-text-secondary mt-1">
                  Share these credentials with the staff member to let them log in.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Role & Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      newRole === 'staff'
                        ? 'border-tertiary bg-tertiary-soft/40 text-text-primary'
                        : 'border-border-main hover:bg-bg-main/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="staff"
                      checked={newRole === 'staff'}
                      onChange={() => setNewRole('staff')}
                      className="mt-0.5 text-tertiary"
                    />
                    <div>
                      <div className="font-semibold text-xs text-text-primary">Staff Member</div>
                      <div className="text-[11px] text-text-secondary">Schedule & Patients access</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      newRole === 'admin'
                        ? 'border-primary bg-primary-soft/40 text-text-primary'
                        : 'border-border-main hover:bg-bg-main/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={newRole === 'admin'}
                      onChange={() => setNewRole('admin')}
                      className="mt-0.5 text-primary"
                    />
                    <div>
                      <div className="font-semibold text-xs text-text-primary">Administrator</div>
                      <div className="text-[11px] text-text-secondary">Full clinic system access</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border-main rounded-lg text-sm text-text-secondary hover:bg-bg-main font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-surface rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6 border border-border-main animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border-main mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-soft text-primary rounded-lg">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Reset Password</h3>
                  <p className="text-xs text-text-secondary">{resetTargetUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetModalError && (
              <div className="bg-status-error-soft text-status-error p-3 rounded-lg text-sm mb-4">
                {resetModalError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-text-secondary uppercase">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetNewPassword(generateRandomPassword())}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface text-text-primary border border-border-main rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 border border-border-main rounded-lg text-sm text-text-secondary hover:bg-bg-main font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-4 py-2 bg-primary text-surface rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {resetSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

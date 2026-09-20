'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeft, Calendar, Clock, DollarSign, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ProfileData {
  overview: {
    id: number;
    name: string;
    phone: string;
    age: number | null;
    gender: string | null;
    address: string | null;
    condition: string | null;
    package: string | null;
  };
  sessions: {
    id: number;
    date: string;
    start_time: string;
    status: string;
    notes: string | null;
    therapist_name: string;
  }[];
  billing: {
    id: number;
    service_package: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

export default function PatientProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/patients/${id}/profile`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch patient profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  if (loading) return <div className="text-text-secondary text-center p-8">Loading profile...</div>;
  if (!data) return <div className="text-text-secondary text-center p-8">Patient not found.</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-status-success-soft text-status-success border-status-success/20';
      case 'due':
      case 'cancelled':
        return 'bg-status-error-soft text-status-error border-status-error/20';
      case 'overdue':
        return 'bg-status-error text-surface border-status-error font-bold';
      default:
        return 'bg-status-info-soft text-status-info border-status-info/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-surface rounded-lg transition-colors border border-transparent hover:border-border-main"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-fraunces font-bold text-text-primary">{data.overview.name}</h1>
          <p className="text-sm text-text-secondary font-mono">Patient ID: {data.overview.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface rounded-xl shadow-md border border-border-main p-6">
            <h2 className="text-lg font-fraunces font-bold text-text-primary mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Patient Overview
            </h2>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Contact</span>
                <p className="text-text-primary font-medium">{data.overview.phone}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Age</span>
                  <p className="text-text-primary font-medium">{data.overview.age || 'N/A'}</p>
                </div>
                <div>
                  <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Gender</span>
                  <p className="text-text-primary font-medium">{data.overview.gender || 'N/A'}</p>
                </div>
              </div>

              <div>
                <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Address</span>
                <p className="text-text-primary font-medium">{data.overview.address || 'N/A'}</p>
              </div>

              <div className="pt-4 border-t border-border-main">
                <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Condition</span>
                <p className="text-text-primary font-medium">{data.overview.condition || 'N/A'}</p>
              </div>

              <div>
                <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Active Package</span>
                <p className="text-text-primary font-medium">{data.overview.package || 'None'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* History Panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Session History */}
          <div className="bg-surface rounded-xl shadow-md border border-border-main overflow-hidden">
            <div className="px-6 py-4 border-b border-border-main bg-bg-main flex items-center gap-2">
              <Calendar className="w-5 h-5 text-text-secondary" />
              <h2 className="text-lg font-fraunces font-bold text-text-primary">Session History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-text-secondary border-b border-border-main uppercase tracking-wider bg-surface">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date & Time</th>
                    <th className="px-6 py-3 font-medium">Therapist</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main text-sm">
                  {data.sessions.length > 0 ? (
                    data.sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-bg-main/50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="font-medium text-text-primary">{format(parseISO(session.date), 'MMM dd, yyyy')}</div>
                          <div className="text-text-secondary font-mono text-xs">{session.start_time.substring(0,5)}</div>
                        </td>
                        <td className="px-6 py-3 text-text-secondary">{session.therapist_name}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                            {session.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-text-secondary">No sessions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-surface rounded-xl shadow-md border border-border-main overflow-hidden">
            <div className="px-6 py-4 border-b border-border-main bg-bg-main flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-text-secondary" />
              <h2 className="text-lg font-fraunces font-bold text-text-primary">Billing History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-text-secondary border-b border-border-main uppercase tracking-wider bg-surface">
                  <tr>
                    <th className="px-6 py-3 font-medium">Invoice ID</th>
                    <th className="px-6 py-3 font-medium">Service / Package</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main text-sm">
                  {data.billing.length > 0 ? (
                    data.billing.map((inv) => (
                      <tr key={inv.id} className="hover:bg-bg-main/50 transition-colors">
                        <td className="px-6 py-3 font-mono text-text-secondary">
                          INV-{inv.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-6 py-3 text-text-primary font-medium">{inv.service_package}</td>
                        <td className="px-6 py-3 font-mono font-bold text-text-primary">${inv.amount.toFixed(2)}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-text-secondary">No invoices recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

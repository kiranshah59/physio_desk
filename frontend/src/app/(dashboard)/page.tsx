'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Users, UserRoundCog, DollarSign, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardPatient {
  id: number;
  name: string;
  condition: string | null;
  assigned_therapist_name: string | null;
  package: string | null;
  status: string;
  created_at: string;
}

interface DashboardStats {
  patients_seen_today: number;
  therapists_on_duty_today: number;
  revenue_collected_today: number;
  open_slots_remaining_today: number;
  therapist_capacities: {
    therapist_id: number;
    therapist_name: string;
    total_slots: number;
    booked_slots: number;
    free_slots: number;
  }[];
  recent_patients: DashboardPatient[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/');
        setStats(response.data);
      } catch {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4 text-text-secondary">Loading stats...</div>;
  if (error) return <div className="text-status-error">{error}</div>;
  if (!stats) return null;

  const statCards = [
    { title: 'Patients Seen Today', value: stats.patients_seen_today, icon: Users, color: 'text-primary', bg: 'bg-primary-soft' },
    { title: 'Therapists On Duty', value: stats.therapists_on_duty_today, icon: UserRoundCog, color: 'text-secondary-light', bg: 'bg-border-main' },
    { title: 'Revenue Collected', value: `$${stats.revenue_collected_today.toFixed(2)}`, icon: DollarSign, color: 'text-status-success', bg: 'bg-status-success-soft' },
    { title: 'Open Slots Remaining', value: stats.open_slots_remaining_today, icon: Clock, color: 'text-status-info', bg: 'bg-status-info-soft' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-fraunces font-bold text-text-primary">Dashboard Overview</h1>
          <p className="text-text-secondary mt-1">Here's what's happening at PhysioDesk today.</p>
        </div>
        <div className="text-text-secondary font-medium flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-surface rounded-xl shadow-md border border-border-main p-6 flex items-center gap-4">
              <div className={`p-4 rounded-full ${card.bg} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">{card.title}</p>
                <h3 className="text-2xl font-fraunces font-bold text-text-primary mt-1">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients Table */}
        <div className="lg:col-span-2 bg-surface rounded-xl shadow-md border border-border-main">
          <div className="p-6 border-b border-border-main">
            <h2 className="text-lg font-fraunces font-bold text-text-primary">Recent Patients</h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-bg-main text-text-secondary text-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Condition</th>
                  <th className="px-6 py-3 font-medium">Therapist</th>
                  <th className="px-6 py-3 font-medium">Package</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-text-primary">
                {stats.recent_patients.length > 0 ? (
                  stats.recent_patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-bg-main/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{patient.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-bg-main border border-border-main text-text-secondary px-2.5 py-1 rounded-full text-xs font-medium">
                          {patient.condition || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {patient.assigned_therapist_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {patient.package || 'None'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        <span className="bg-bg-main border border-border-main px-2.5 py-1 rounded-full text-xs font-medium uppercase">
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                      No recent patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Therapist Capacities */}
        <div className="bg-surface rounded-xl shadow-md border border-border-main">
          <div className="p-6 border-b border-border-main">
            <h2 className="text-lg font-fraunces font-bold text-text-primary">Today's Capacity</h2>
          </div>
          <div className="p-6 space-y-6">
            {stats.therapist_capacities.length > 0 ? (
              stats.therapist_capacities.map((cap: any) => {
                const percentBooked = cap.total_slots > 0 
                  ? Math.round((cap.booked_slots / cap.total_slots) * 100) 
                  : 0;
                
                let barColor = 'bg-status-success';
                if (percentBooked > 80) barColor = 'bg-status-error';
                else if (percentBooked > 60) barColor = 'bg-primary';

                return (
                  <div key={cap.therapist_id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-text-primary">{cap.therapist_name}</span>
                      <span className="text-sm font-bold text-text-secondary font-mono">
                        {cap.booked_slots} / {cap.total_slots} booked
                      </span>
                    </div>
                    <div className="w-full bg-border-main rounded-full h-2.5">
                      <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentBooked}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-text-secondary text-center py-4">No therapists on duty today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

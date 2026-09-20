'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Users, UserRoundCog, DollarSign, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/');
        setStats(response.data);
      } catch (err: any) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4">Loading stats...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  const statCards = [
    { title: 'Patients Seen Today', value: stats.patients_seen_today, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Therapists On Duty', value: stats.therapists_on_duty_today, icon: UserRoundCog, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Revenue Collected', value: `$${stats.revenue_collected_today.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Open Slots Remaining', value: stats.open_slots_remaining_today, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Here's what's happening at PhysioDesk today.</p>
        </div>
        <div className="text-slate-500 font-medium flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
              <div className={`p-4 rounded-full ${card.bg} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Recent Patients</h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Condition</th>
                  <th className="px-6 py-3 font-medium">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats.recent_patients.length > 0 ? (
                  stats.recent_patients.map((patient: any) => (
                    <tr key={patient.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium">{patient.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-medium">
                          {patient.condition || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(patient.created_at), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No recent patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Therapist Capacities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Today's Capacity</h2>
          </div>
          <div className="p-6 space-y-6">
            {stats.therapist_capacities.length > 0 ? (
              stats.therapist_capacities.map((cap: any) => {
                const percentBooked = cap.total_slots > 0 
                  ? Math.round((cap.booked_slots / cap.total_slots) * 100) 
                  : 0;
                
                let barColor = 'bg-teal-500';
                if (percentBooked > 80) barColor = 'bg-red-500';
                else if (percentBooked > 60) barColor = 'bg-amber-500';

                return (
                  <div key={cap.therapist_id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">{cap.therapist_name}</span>
                      <span className="text-sm font-bold text-slate-500">
                        {cap.booked_slots} / {cap.total_slots} booked
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentBooked}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-center py-4">No therapists on duty today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

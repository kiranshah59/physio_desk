'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Calendar, Clock, User, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Appointment {
  id: number;
  patient_id: number;
  therapist_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  patient?: { name: string };
  therapist?: { name: string };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '', therapist_id: '', date: format(new Date(), 'yyyy-MM-dd'), start_time: '09:00:00', end_time: '09:30:00', status: 'scheduled', notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchData();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/');
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const pRes = await api.get('/patients/');
      setPatients(pRes.data);
      const tRes = await api.get('/therapists/');
      setTherapists(tRes.data);
    } catch (err) {
      console.error('Failed to fetch data for selects');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments/', {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        therapist_id: parseInt(formData.therapist_id),
      });
      setIsModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to book appointment');
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-status-info-soft text-status-info border-status-info/20';
      case 'completed': return 'bg-status-success-soft text-status-success border-status-success/20';
      case 'cancelled': return 'bg-status-error-soft text-status-error border-status-error/20';
      default: return 'bg-bg-main text-text-secondary border-border-main';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-surface px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border-main overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-main text-text-secondary text-sm border-b border-border-main">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Therapist</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">Loading appointments...</td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-bg-main/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-text-secondary" />
                        {format(parseISO(apt.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-text-secondary flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {apt.start_time.substring(0,5)} - {apt.end_time.substring(0,5)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-secondary" />
                        {apt.patient?.name || `ID: ${apt.patient_id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {apt.therapist?.name || `ID: ${apt.therapist_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {apt.status === 'scheduled' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleStatusUpdate(apt.id, 'completed')} className="text-xs bg-status-success-soft text-status-success hover:bg-status-success hover:text-surface px-3 py-1 rounded-md transition-colors font-medium border border-status-success/20">
                            Complete
                          </button>
                          <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} className="text-xs bg-status-error-soft text-status-error hover:bg-status-error hover:text-surface px-3 py-1 rounded-md transition-colors font-medium border border-status-error/20">
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-border-main">
            <div className="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-main">
              <h3 className="text-lg font-bold text-text-primary">Book Appointment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary text-xl font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Patient *</label>
                  <select required value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Select Patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Therapist *</label>
                  <select required value={formData.therapist_id} onChange={(e) => setFormData({...formData, therapist_id: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Select Therapist...</option>
                    {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Date *</label>
                <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Start Time *</label>
                  <input required type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value+':00'})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">End Time *</label>
                  <input required type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value+':00'})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:bg-bg-main border border-transparent hover:border-border-main rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:opacity-90 text-surface rounded-lg font-medium transition-colors">Book Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data for selects
  const [patients, setPatients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    patient_id: '', therapist_id: '', date: format(new Date(), 'yyyy-MM-dd'), start_time: '10:00:00', end_time: '10:30:00', notes: '' 
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get('/patients/'),
        api.get('/therapists/')
      ]);
      setPatients(pRes.data);
      setTherapists(tRes.data);
    } catch (err) {
      console.error('Failed to fetch data for selects');
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/appointments/', {
        patient_id: parseInt(formData.patient_id),
        therapist_id: parseInt(formData.therapist_id),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes
      });
      setIsModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      console.error('Failed to create appointment', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to book appointment. Check for double booking.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Cancel this appointment?')) return;
    // In our backend we have delete, but often we just update status to cancelled. 
    // Wait, we didn't implement a cancel endpoint specifically, but we have DELETE. Let's delete it for simplicity.
    try {
      // Actually we have a PUT to update. Let's update status to cancelled
      await api.put(`/appointments/${id}`, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Appointments Schedule</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Patient ID</th>
                <th className="px-6 py-4 font-medium">Therapist ID</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading schedule...</td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {appt.date} <br/>
                      <span className="text-sm font-normal text-slate-500">{appt.start_time.substring(0,5)} - {appt.end_time.substring(0,5)}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">#{appt.patient_id}</td>
                    <td className="px-6 py-4 text-slate-600">#{appt.therapist_id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        appt.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {appt.status === 'booked' && (
                        <button onClick={() => handleDelete(appt.id)} className="text-slate-400 hover:text-red-600 p-2" title="Cancel">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No appointments scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Book Appointment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            {errorMsg && (
              <div className="m-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                  <select required value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                    <option value="">Select...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Therapist *</label>
                  <select required value={formData.therapist_id} onChange={(e) => setFormData({...formData, therapist_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                    <option value="">Select...</option>
                    {therapists.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time (HH:MM:SS) *</label>
                  <input required type="text" placeholder="10:00:00" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time (HH:MM:SS) *</label>
                  <input required type="text" placeholder="10:30:00" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

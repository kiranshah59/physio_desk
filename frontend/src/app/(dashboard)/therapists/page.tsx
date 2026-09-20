'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Therapist {
  id: number;
  name: string;
  specialty: string;
  working_days: number[];
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TherapistsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', specialty: '', start_time: '09:00:00', end_time: '17:00:00', slot_duration_minutes: 30, working_days: [1,2,3,4,5] 
  });

  useEffect(() => {
    // Role-based UI logic: kick out staff members
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchTherapists();
  }, [user, router]);

  const fetchTherapists = async () => {
    try {
      const res = await api.get('/therapists/');
      setTherapists(res.data);
    } catch (err) {
      console.error('Failed to fetch therapists', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/therapists/', formData);
      setIsModalOpen(false);
      fetchTherapists();
    } catch (err) {
      console.error('Failed to create therapist', err);
      alert('Failed to save therapist. Ensure times are in HH:MM:SS format.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this therapist?')) return;
    try {
      await api.delete(`/therapists/${id}`);
      fetchTherapists();
    } catch (err) {
      console.error('Failed to delete therapist', err);
    }
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Therapist Management</h1>
          <p className="text-sm text-slate-500 mt-1">Admin access only</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Therapist
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Specialty</th>
                <th className="px-6 py-4 font-medium">Working Days</th>
                <th className="px-6 py-4 font-medium">Shift</th>
                <th className="px-6 py-4 font-medium">Slot Length</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading therapists...</td>
                </tr>
              ) : therapists.length > 0 ? (
                therapists.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                        {t.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {t.working_days.map(d => WEEKDAYS[d-1].substring(0,3)).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {t.start_time.substring(0,5)} - {t.end_time.substring(0,5)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {t.slot_duration_minutes} min
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 p-2" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-red-600 p-2" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No therapists found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Therapist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Add New Therapist</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialty *</label>
                  <input required type="text" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Working Days (1=Mon, 7=Sun)</label>
                <div className="flex gap-2">
                  {WEEKDAYS.map((day, idx) => {
                    const dayNum = idx + 1;
                    const isSelected = formData.working_days.includes(dayNum);
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({...formData, working_days: formData.working_days.filter(d => d !== dayNum)});
                          } else {
                            setFormData({...formData, working_days: [...formData.working_days, dayNum].sort()});
                          }
                        }}
                        className={`w-10 h-10 rounded-full text-xs font-medium transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {day.substring(0, 1)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time (HH:MM:SS)</label>
                  <input required type="text" placeholder="09:00:00" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time (HH:MM:SS)</label>
                  <input required type="text" placeholder="17:00:00" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slot Duration</label>
                  <select value={formData.slot_duration_minutes} onChange={(e) => setFormData({...formData, slot_duration_minutes: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Save Therapist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

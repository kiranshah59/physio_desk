'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  phone: string;
  age: number | null;
  gender: string | null;
  address: string | null;
  condition: string | null;
  status: 'active' | 'on_hold' | 'completed' | 'discharged';
  package: string | null;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  
  const defaultForm = { name: '', phone: '', age: '', gender: '', address: '', condition: '', status: 'active', package: '' };
  const [formData, setFormData] = useState(defaultForm);

  const fetchPatients = async (query = '', currentFilter = 'all') => {
    try {
      const res = await api.get('/patients/', {
        params: {
          name: query || undefined,
          status: currentFilter === 'all' ? undefined : currentFilter,
        }
      });
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(search, filter);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setSearch(nextValue);
    fetchPatients(nextValue, filter);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    fetchPatients(search, value);
  };

  const openAddModal = () => {
    setEditingPatientId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setFormData({
      name: patient.name,
      phone: patient.phone,
      age: patient.age ? patient.age.toString() : '',
      gender: patient.gender || '',
      address: patient.address || '',
      condition: patient.condition || '',
      status: patient.status || 'active',
      package: patient.package || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      status: formData.status || 'active',
    };
    
    try {
      if (editingPatientId) {
        await api.put(`/patients/${editingPatientId}`, payload);
      } else {
        await api.post('/patients/', payload);
      }
      setIsModalOpen(false);
      setFormData(defaultForm);
      fetchPatients(search, filter);
    } catch (err) {
      console.error('Failed to save patient', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients(search, filter);
    } catch (err) {
      console.error('Failed to delete patient', err);
    }
  };

  const formatStatus = (status: Patient['status']) => status
    .replace('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const statusBadgeClass = (status: Patient['status']) => {
    switch (status) {
      case 'active':
        return 'bg-status-info-soft text-status-info border-status-info/20';
      case 'completed':
        return 'bg-status-success-soft text-status-success border-status-success/20';
      case 'on_hold':
        return 'bg-status-warning-soft text-status-warning border-status-warning/20';
      case 'discharged':
        return 'bg-status-error-soft text-status-error border-status-error/20';
      default:
        return 'bg-bg-main text-text-secondary border-border-main';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-fraunces font-bold text-text-primary">Patients Directory</h1>
        <button
          onClick={openAddModal}
          className="bg-primary text-surface px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      <div className="bg-surface p-4 rounded-xl shadow-md border border-border-main flex items-center gap-3">
        <Search className="w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={handleSearch}
          className="flex-1 outline-none text-text-primary bg-transparent"
        />
        <div className="border-l border-border-main pl-3">
          <select 
            value={filter} 
            onChange={(e) => handleFilterChange(e.target.value)}
            className="bg-bg-main text-text-secondary text-sm px-3 py-1.5 rounded-lg border border-border-main outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-md border border-border-main overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-main text-text-secondary text-sm border-b border-border-main">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Condition & Package</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">Loading patients...</td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-bg-main/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <div 
                        className="cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => router.push(`/patients/${patient.id}`)}
                      >
                        {patient.name}
                        <Eye className="w-3 h-3 text-text-secondary" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">{patient.phone}</td>
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      {patient.age ? `${patient.age} y/o` : 'N/A'}{patient.gender ? `, ${patient.gender}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(patient.status)}`}>
                          {formatStatus(patient.status)}
                        </span>
                        <span className="bg-status-info-soft text-status-info px-3 py-1 rounded-full text-xs font-medium border border-status-info/20">
                          {patient.condition || 'N/A'}
                        </span>
                        {patient.package && (
                          <span className="text-xs text-text-secondary">{patient.package}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(patient)} className="text-text-secondary hover:text-primary p-2 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(patient.id)} className="text-text-secondary hover:text-status-error p-2 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-border-main">
            <div className="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-main">
              <h3 className="text-lg font-fraunces font-bold text-text-primary">
                {editingPatientId ? 'Edit Patient' : 'Add New Patient'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Phone Number *</label>
                  <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Age</label>
                  <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Address</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Primary Condition</label>
                  <input type="text" value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} placeholder="e.g. Lower Back Pain" className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Treatment Package</label>
                <input type="text" value={formData.package} onChange={(e) => setFormData({...formData, package: e.target.value})} placeholder="e.g. Standard Rehab" className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:bg-bg-main border border-transparent hover:border-border-main rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:opacity-90 text-surface rounded-lg font-medium transition-colors">
                  {editingPatientId ? 'Update Patient' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

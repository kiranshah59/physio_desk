'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, DollarSign, User, X, Edit2, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Invoice {
  id: number;
  patient_id: number;
  service_package: string;
  amount: number;
  discount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  patient?: { name: string };
}

export default function BillingPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const defaultForm = {
    patient_id: '', service_package: '', amount: '', discount: '0', status: 'due', payment_method: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices/');
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const pRes = await api.get('/patients/');
      setPatients(pRes.data);
    } catch (err) {
      console.error('Failed to fetch patients');
    }
  };

  const openAddModal = () => {
    setEditingInvoiceId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setFormData({
      patient_id: invoice.patient_id.toString(),
      service_package: invoice.service_package,
      amount: invoice.amount.toString(),
      discount: invoice.discount.toString(),
      status: invoice.status,
      payment_method: invoice.payment_method || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        amount: parseFloat(formData.amount),
        discount: parseFloat(formData.discount || '0'),
        payment_method: formData.payment_method || null,
        date: new Date().toISOString().split('T')[0]
      };

      if (editingInvoiceId) {
        await api.put(`/invoices/${editingInvoiceId}`, {
          status: payload.status,
          payment_method: payload.payment_method,
          discount: payload.discount,
          amount: payload.amount
        });
      } else {
        await api.post('/invoices/', payload);
      }
      setIsModalOpen(false);
      setFormData(defaultForm);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save invoice');
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/invoices/${id}`, { status });
      fetchInvoices();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to void this invoice?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (err) {
      console.error('Failed to delete invoice', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-status-success-soft text-status-success border-status-success/20';
      case 'due': return 'bg-status-error-soft text-status-error border-status-error/20';
      case 'overdue': return 'bg-status-error text-surface border-status-error font-bold';
      default: return 'bg-bg-main text-text-secondary border-border-main';
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus = filter === 'all' || invoice.status.toLowerCase() === filter;
    const patientName = invoice.patient?.name || `ID: ${invoice.patient_id}`;
    const matchesSearch = patientName.toLowerCase().includes(search.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-fraunces font-bold text-text-primary">Billing & Invoices</h1>
        {user?.role === 'admin' && (
          <button
            onClick={openAddModal}
            className="bg-primary text-surface px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </button>
        )}
      </div>

      <div className="bg-surface p-4 rounded-xl shadow-md border border-border-main flex items-center gap-3">
        <div className="w-5 h-5 text-text-secondary">🔍</div>
        <input
          type="text"
          placeholder="Search invoices by patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-text-primary bg-transparent"
        />
        <div className="border-l border-border-main pl-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-bg-main text-text-secondary text-sm px-3 py-1.5 rounded-lg border border-border-main outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="due">Due</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-md border border-border-main overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-main text-text-secondary text-sm border-b border-border-main">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Service Package</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-bg-main/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary font-mono">
                      INV-{inv.id.toString().padStart(4, '0')}
                      <br/>
                      <span className="text-xs text-text-secondary font-sans font-normal">
                        {format(parseISO(inv.created_at), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-secondary" />
                        {inv.patient?.name || <span className="font-mono">ID: {inv.patient_id}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {inv.service_package}
                      {inv.discount > 0 && <span className="block text-xs text-status-success mt-1">-${inv.discount.toFixed(2)} discount</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-text-primary font-mono text-lg">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === 'due' && (
                          <button onClick={() => handleStatusUpdate(inv.id, 'paid')} className="text-xs bg-status-success-soft text-status-success hover:bg-status-success hover:text-surface px-3 py-1.5 rounded-md transition-colors font-medium border border-status-success/20 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Mark Paid
                          </button>
                        )}
                        {user?.role === 'admin' && (
                          <>
                            <button onClick={() => openEditModal(inv)} className="text-text-secondary hover:text-primary p-1.5 transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(inv.id)} className="text-text-secondary hover:text-status-error p-1.5 transition-colors" title="Void Invoice">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                    {invoices.length === 0 ? 'No invoices found.' : 'No invoices match these filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Invoice Modal */}
      {isModalOpen && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-border-main">
            <div className="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-main">
              <h3 className="text-lg font-fraunces font-bold text-text-primary">
                {editingInvoiceId ? 'Edit Invoice' : 'Create Invoice'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary text-xl font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Patient *</label>
                <select disabled={!!editingInvoiceId} required value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} className={`w-full px-3 py-2 text-text-primary border border-border-main rounded-lg outline-none ${editingInvoiceId ? 'bg-bg-main cursor-not-allowed' : 'bg-surface focus:ring-2 focus:ring-primary'}`}>
                  <option value="">Select Patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Service / Package *</label>
                <input disabled={!!editingInvoiceId} required type="text" placeholder="e.g. Standard Rehab Package" value={formData.service_package} onChange={(e) => setFormData({...formData, service_package: e.target.value})} className={`w-full px-3 py-2 text-text-primary border border-border-main rounded-lg outline-none ${editingInvoiceId ? 'bg-bg-main cursor-not-allowed' : 'bg-surface focus:ring-2 focus:ring-primary'}`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Amount ($) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Discount ($)</label>
                  <input type="number" step="0.01" min="0" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select required value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="due">Due</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                {formData.status === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Payment Method</label>
                    <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                      <option value="">Select Method...</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:bg-bg-main border border-transparent hover:border-border-main rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:opacity-90 text-surface rounded-lg font-medium transition-colors">
                  {editingInvoiceId ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

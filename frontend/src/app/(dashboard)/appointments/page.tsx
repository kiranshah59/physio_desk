'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { format, parseISO, addMinutes, setHours, setMinutes, isBefore, isAfter, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, User, Edit2 } from 'lucide-react';

interface Therapist {
  id: number;
  name: string;
  specialty: string;
  working_days: number[];
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

interface Appointment {
  id: number;
  patient_id: number;
  therapist_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_method: string | null;
  notes: string | null;
  patient?: { name: string };
}

// Generate time slots from 08:00 to 18:00 every 30 mins
const generateTimeSlots = () => {
  const slots = [];
  let current = setMinutes(setHours(new Date(), 8), 0);
  const end = setMinutes(setHours(new Date(), 18), 0);
  
  while (current <= end) {
    slots.push(format(current, 'HH:mm:ss'));
    current = addMinutes(current, 30);
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots();

export default function AppointmentsCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ therapistId: number, time: string } | null>(null);
  const [bookingForm, setBookingForm] = useState({
    patient_id: '', duration: 30, payment_method: '', notes: ''
  });

  // Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  
  // Reschedule Mode
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', start_time: '', duration: 30 });

  useEffect(() => {
    fetchData();
    fetchPatients();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const [therapistsRes, apptsRes] = await Promise.all([
        api.get('/therapists/'),
        api.get(`/appointments/?appt_date=${formattedDate}`)
      ]);
      
      // Filter therapists to those working on the selected day (1=Mon, 7=Sun)
      // JS getDay(): 0=Sun, 1=Mon. We map it to 1=Mon, 7=Sun
      let dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0) dayOfWeek = 7;
      
      const activeTherapists = therapistsRes.data.filter((t: Therapist) => 
        t.working_days.includes(dayOfWeek)
      );
      
      setTherapists(activeTherapists);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error('Failed to fetch calendar data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients/');
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const openBookModal = (therapistId: number, time: string, defaultDuration: number) => {
    setSelectedSlot({ therapistId, time });
    setBookingForm({ patient_id: '', duration: defaultDuration, payment_method: '', notes: '' });
    setIsBookingModalOpen(true);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    // Calculate end time
    const [hours, mins] = selectedSlot.time.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, mins, 0, 0);
    const endDate = addMinutes(startDate, bookingForm.duration);
    const endTimeStr = format(endDate, 'HH:mm:ss');

    try {
      await api.post('/appointments/', {
        patient_id: parseInt(bookingForm.patient_id),
        therapist_id: selectedSlot.therapistId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedSlot.time,
        end_time: endTimeStr,
        payment_method: bookingForm.payment_method || null,
        notes: bookingForm.notes || null,
        status: 'booked'
      });
      setIsBookingModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to book appointment');
    }
  };

  const openDetailsModal = (appt: Appointment) => {
    setActiveAppointment(appt);
    setIsRescheduling(false);
    setIsDetailsModalOpen(true);
  };

  const startReschedule = () => {
    if (!activeAppointment) return;
    setIsRescheduling(true);
    
    // calc duration
    const start = parseISO(`2000-01-01T${activeAppointment.start_time}`);
    const end = parseISO(`2000-01-01T${activeAppointment.end_time}`);
    const diffMins = (end.getTime() - start.getTime()) / 60000;

    setRescheduleForm({
      date: activeAppointment.date,
      start_time: activeAppointment.start_time.substring(0,5),
      duration: diffMins
    });
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppointment) return;

    const [hours, mins] = rescheduleForm.start_time.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, mins, 0, 0);
    const endDate = addMinutes(startDate, rescheduleForm.duration);
    const endTimeStr = format(endDate, 'HH:mm:ss');

    try {
      await api.put(`/appointments/${activeAppointment.id}`, {
        date: rescheduleForm.date,
        start_time: rescheduleForm.start_time + ':00',
        end_time: endTimeStr
      });
      setIsDetailsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reschedule. Ensure slot is free.');
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!activeAppointment) return;
    try {
      await api.put(`/appointments/${activeAppointment.id}`, { status });
      setIsDetailsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  // Grid Cell Logic
  const renderCell = (therapist: Therapist, timeStr: string) => {
    // Check if therapist is working at this time
    const tStart = therapist.start_time;
    const tEnd = therapist.end_time;
    
    const isWithinShift = timeStr >= tStart && timeStr < tEnd;
    
    if (!isWithinShift) {
      return (
        <div className="h-16 flex items-center justify-center bg-bg-main/30 border border-border-main text-text-secondary/50 text-xs font-medium cursor-not-allowed">
          Off
        </div>
      );
    }

    // Check for appointments
    // We render the appointment if it STARTS at this time, OR if it overlaps this 30 min block.
    // For simplicity, we just find the appointment that overlaps this block.
    const [h, m] = timeStr.split(':').map(Number);
    const blockStart = h * 60 + m;
    const blockEnd = blockStart + 30;

    const overlappingAppt = appointments.find(a => {
      if (a.therapist_id !== therapist.id || a.status === 'cancelled') return false;
      const [sH, sM] = a.start_time.split(':').map(Number);
      const [eH, eM] = a.end_time.split(':').map(Number);
      const aStart = sH * 60 + sM;
      const aEnd = eH * 60 + eM;
      // Overlap logic: blockStart < aEnd AND blockEnd > aStart
      return blockStart < aEnd && blockEnd > aStart;
    });

    if (overlappingAppt) {
      // Is this the start of the appointment?
      const [sH, sM] = overlappingAppt.start_time.split(':').map(Number);
      const aStart = sH * 60 + sM;
      const isStart = blockStart <= aStart;

      return (
        <div 
          onClick={() => openDetailsModal(overlappingAppt)}
          className={`h-16 border border-status-info cursor-pointer transition-colors ${
            isStart ? 'bg-status-info-soft text-status-info border-t-2' : 'bg-status-info-soft/50 text-transparent border-t-0'
          } ${overlappingAppt.status === 'completed' ? 'border-status-success bg-status-success-soft text-status-success' : ''}`}
        >
          {isStart && (
            <div className="p-1 h-full flex flex-col justify-center">
              <span className="font-bold text-xs truncate block">{overlappingAppt.patient?.name || 'Patient'}</span>
              <span className="text-[10px] font-mono opacity-80">{overlappingAppt.start_time.substring(0,5)} - {overlappingAppt.end_time.substring(0,5)}</span>
            </div>
          )}
        </div>
      );
    }

    // Free Slot
    return (
      <div 
        onClick={() => openBookModal(therapist.id, timeStr, therapist.slot_duration_minutes)}
        className="h-16 flex items-center justify-center border border-border-main hover:bg-bg-main hover:border-primary/50 text-transparent hover:text-primary cursor-pointer transition-all group relative"
      >
        <span className="text-xs font-bold opacity-0 group-hover:opacity-100">+ Book</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl shadow-md border border-border-main">
        <h1 className="text-2xl font-fraunces font-bold text-text-primary">Calendar</h1>
        
        <div className="flex items-center gap-4">
          <button onClick={handlePrevDay} className="p-2 hover:bg-bg-main rounded-lg border border-border-main transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-primary" />
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-bg-main rounded-lg border border-border-main min-w-[200px] justify-center">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span className="font-bold text-text-primary">
              {format(selectedDate, 'EEEE, MMM do, yyyy')}
            </span>
          </div>
          
          <button onClick={handleNextDay} className="p-2 hover:bg-bg-main rounded-lg border border-border-main transition-colors">
            <ChevronRight className="w-5 h-5 text-text-primary" />
          </button>
        </div>
        
        <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 text-sm font-medium text-primary hover:bg-bg-main border border-primary/20 rounded-lg transition-colors">
          Today
        </button>
      </div>

      {/* Grid Container */}
      <div className="bg-surface rounded-xl shadow-md border border-border-main overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-secondary">Loading schedule...</div>
        ) : therapists.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">No therapists are scheduled to work on this day.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              
              {/* Grid Header (Therapists) */}
              <div className="flex border-b border-border-main bg-bg-main">
                <div className="w-24 shrink-0 flex items-center justify-center border-r border-border-main text-xs font-bold text-text-secondary uppercase">
                  Time
                </div>
                {therapists.map(t => (
                  <div key={t.id} className="flex-1 min-w-[150px] p-3 text-center border-r border-border-main last:border-r-0">
                    <div className="font-bold text-text-primary">{t.name}</div>
                    <div className="text-xs text-text-secondary">{t.specialty}</div>
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="bg-surface">
                {TIME_SLOTS.map(time => (
                  <div key={time} className="flex">
                    <div className="w-24 shrink-0 flex items-center justify-center border-r border-b border-border-main bg-bg-main/50 font-mono text-sm text-text-secondary">
                      {time.substring(0, 5)}
                    </div>
                    {therapists.map(t => (
                      <div key={`${t.id}-${time}`} className="flex-1 min-w-[150px]">
                        {renderCell(t, time)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-main">
            <div className="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-main">
              <h3 className="text-lg font-fraunces font-bold text-text-primary">Book Appointment</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-text-secondary hover:text-text-primary text-xl font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              <div className="bg-bg-main p-3 rounded-lg border border-border-main mb-4">
                <p className="text-sm text-text-secondary">
                  Booking with <span className="font-bold text-text-primary">{therapists.find(t=>t.id===selectedSlot.therapistId)?.name}</span>
                </p>
                <p className="text-sm text-text-secondary font-mono mt-1">
                  {format(selectedDate, 'MMM dd')} at {selectedSlot.time.substring(0,5)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Patient *</label>
                <select required value={bookingForm.patient_id} onChange={(e) => setBookingForm({...bookingForm, patient_id: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Select Patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Duration (mins)</label>
                  <select required value={bookingForm.duration} onChange={(e) => setBookingForm({...bookingForm, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Payment</label>
                  <select value={bookingForm.payment_method} onChange={(e) => setBookingForm({...bookingForm, payment_method: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="">None / To be paid</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
                <textarea rows={3} value={bookingForm.notes} onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 text-text-secondary hover:bg-bg-main border border-transparent hover:border-border-main rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:opacity-90 text-surface rounded-lg font-medium transition-colors">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details/Reschedule Modal */}
      {isDetailsModalOpen && activeAppointment && (
        <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-main">
            <div className="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-main">
              <h3 className="text-lg font-fraunces font-bold text-text-primary">
                {isRescheduling ? 'Reschedule Appointment' : 'Appointment Details'}
              </h3>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-text-secondary hover:text-text-primary text-xl font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!isRescheduling ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 bg-bg-main p-4 rounded-xl border border-border-main">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{activeAppointment.patient?.name || `Patient ID: ${activeAppointment.patient_id}`}</h4>
                    <p className="text-xs text-text-secondary">With {therapists.find(t=>t.id===activeAppointment.therapist_id)?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Date & Time</span>
                    <p className="text-text-primary font-mono text-sm font-medium">
                      {activeAppointment.date}<br/>
                      {activeAppointment.start_time.substring(0,5)} - {activeAppointment.end_time.substring(0,5)}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Status</span>
                    <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-bold border ${activeAppointment.status === 'booked' ? 'bg-status-info-soft text-status-info border-status-info/20' : activeAppointment.status === 'completed' ? 'bg-status-success-soft text-status-success border-status-success/20' : 'bg-status-error-soft text-status-error border-status-error/20'}`}>
                      {activeAppointment.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {activeAppointment.notes && (
                  <div>
                    <span className="block text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Notes</span>
                    <p className="text-sm text-text-primary bg-bg-main p-3 rounded-lg border border-border-main">{activeAppointment.notes}</p>
                  </div>
                )}

                <div className="pt-4 flex flex-col gap-2">
                  {activeAppointment.status === 'booked' && (
                    <>
                      <button onClick={startReschedule} className="w-full px-4 py-2 bg-bg-main text-text-primary hover:bg-border-main border border-border-main rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <Edit2 className="w-4 h-4" /> Reschedule
                      </button>
                      <button onClick={() => handleStatusUpdate('completed')} className="w-full px-4 py-2 bg-status-success text-surface hover:opacity-90 rounded-lg font-medium transition-colors">
                        Mark as Completed
                      </button>
                      <button onClick={() => handleStatusUpdate('cancelled')} className="w-full px-4 py-2 text-status-error hover:bg-status-error-soft rounded-lg font-medium transition-colors">
                        Cancel Appointment
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">New Date</label>
                  <input required type="date" value={rescheduleForm.date} onChange={(e) => setRescheduleForm({...rescheduleForm, date: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">New Start Time</label>
                    <input required type="time" value={rescheduleForm.start_time} onChange={(e) => setRescheduleForm({...rescheduleForm, start_time: e.target.value})} className="w-full px-3 py-2 bg-surface text-text-primary border border-border-main rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Duration (mins)</label>
                    <input type="number" readOnly value={rescheduleForm.duration} className="w-full px-3 py-2 bg-bg-main text-text-secondary border border-border-main rounded-lg outline-none cursor-not-allowed" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsRescheduling(false)} className="px-4 py-2 text-text-secondary hover:bg-bg-main border border-transparent hover:border-border-main rounded-lg font-medium transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary hover:opacity-90 text-surface rounded-lg font-medium transition-colors">Save Changes</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorDashboard = () => {
  const [specialization, setSpecialization] = useState('');
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionForm, setPrescriptionForm] = useState({});
  const [showFormId, setShowFormId] = useState(null);
  const [isEditingSpecialization, setIsEditingSpecialization] = useState(false);

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const res = await axios.get('/api/doctor/dashboard', { headers });
        setSpecialization(res.data.doctor.specialization || '');
        setSlots(res.data.doctor.available_slots || []);
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const handleSpecializationUpdate = async () => {
    try {
      await axios.put('/api/doctor/specialization', { specialization }, { headers });
      alert('Specialization updated.');
      setIsEditingSpecialization(false);
    } catch (err) {
      console.error('Failed to update specialization:', err);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.time) return alert('Both date and time are required.');

    // Check if the slot is in the past
    const slotDateTime = new Date(`${newSlot.date}T${newSlot.time}`);
    const now = new Date();
    
    if (slotDateTime < now) {
      return alert('Cannot add a slot in the past. Please select a future date and time.');
    }

    try {
      const res = await axios.post('/api/doctor/slots', newSlot, { headers });
      setSlots(res.data.available_slots);
      setNewSlot({ date: '', time: '' });
      setSelectedDate('');
      setAvailableTimeSlots([]);
    } catch (err) {
      console.error('Failed to add slot:', err);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setNewSlot({ ...newSlot, date });
    
    // Generate time slots from 5 PM to 10 PM (30-minute intervals)
    const times = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
    setAvailableTimeSlots(times);
  };

  const handleTimeSelect = (time) => {
    setNewSlot({ ...newSlot, time });
  };

  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Group slots by date
  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    
    // Sort dates
    return Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date,
        slots: grouped[date].sort((a, b) => a.time.localeCompare(b.time))
      }));
  };

  const handleDeleteSlot = async (date, time) => {
    try {
      const res = await axios.delete('/api/doctor/slots', {
        headers,
        data: { date, time }
      });
      setSlots(res.data.available_slots);
    } catch (err) {
      console.error('Failed to delete slot:', err);
    }
  };

  const handlePrescribe = async (appointmentId) => {
    try {
      await axios.post(`/api/prescription/${appointmentId}`, {
        medicines: prescriptionForm.medicines || [],
        notes: prescriptionForm.notes || ''
      }, { headers });
  
      alert('Prescription submitted!');
      setShowFormId(null);
      setPrescriptionForm({});
  
      const updated = appointments.map(a =>
        a._id === appointmentId ? { ...a, status: 'treated' } : a
      );
      setAppointments(updated);
    } catch (err) {
      console.error('Failed to submit prescription:', err.response?.data || err.message);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-irisBlueColor/5 via-white to-primaryColor/5 py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-headingColor mb-2">Doctor Dashboard</h2>
          <p className="text-textColor">Manage your schedule and appointments</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mb-4"></div>
              <p className="text-textColor">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Specialization Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purpleColor to-primaryColor flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-headingColor">Specialization</h3>
                  <p className="text-sm text-textColor">Set your medical specialty</p>
                </div>
              </div>
              {!specialization || isEditingSpecialization ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primaryColor focus:ring-2 focus:ring-primaryColor/20 outline-none transition-all bg-white"
                  >
                    <option value="">Select specialization</option>
                    {[
                      'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist',
                      'Orthopedic', 'Psychiatrist', 'General Physician',
                      'Gynecologist', 'ENT Specialist'
                    ].map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSpecializationUpdate}
                    className="px-6 py-3 bg-gradient-to-r from-primaryColor to-irisBlueColor text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Save
                  </button>
                  {specialization && (
                    <button
                      onClick={() => {
                        setIsEditingSpecialization(false);
                        const fetchDoctorData = async () => {
                          try {
                            const res = await axios.get('/api/doctor/dashboard', { headers });
                            setSpecialization(res.data.doctor.specialization || '');
                          } catch (err) {
                            console.error('Failed to reload specialization:', err);
                          }
                        };
                        fetchDoctorData();
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primaryColor/10 to-irisBlueColor/10 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                      <svg className="w-5 h-5 text-primaryColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-textColor">Your Specialization</p>
                      <p className="font-semibold text-headingColor text-lg">{specialization}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingSpecialization(true)}
                    className="px-4 py-2 bg-white text-primaryColor font-semibold rounded-lg hover:shadow-md transition-all duration-300 border border-primaryColor"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Slots Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-irisBlueColor to-primaryColor flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-headingColor">Add Available Slots</h3>
                  <p className="text-sm text-textColor">Select date and time for appointments</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-headingColor mb-2">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all"
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && availableTimeSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-headingColor mb-2">Select Time Slot</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {availableTimeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                            newSlot.time === time
                              ? 'border-irisBlueColor bg-irisBlueColor text-white shadow-md'
                              : 'border-gray-200 hover:border-irisBlueColor hover:bg-irisBlueColor/10'
                          }`}
                        >
                          <div className="text-center">
                            <p className={`text-sm font-bold ${newSlot.time === time ? 'text-white' : 'text-headingColor'}`}>
                              {formatTime(time)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Button */}
                {newSlot.date && newSlot.time && (
                  <button 
                    onClick={handleAddSlot}
                    className="w-full px-6 py-3 bg-gradient-to-r from-irisBlueColor to-primaryColor text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Add Slot: {new Date(newSlot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime(newSlot.time)}
                  </button>
                )}
              </div>
              
              {/* Display Existing Slots Grouped by Date */}
              {slots.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-headingColor">Your Available Slots</h4>
                    <span className="text-sm text-textColor bg-primaryColor/10 px-4 py-2 rounded-full font-semibold">
                      Total: {slots.length} slot{slots.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-6">
                    {groupSlotsByDate().map((group) => (
                      <div key={group.date} className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        {/* Date Header */}
                        <div className="bg-gradient-to-r from-irisBlueColor to-primaryColor px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-bold text-white text-lg">
                                  {new Date(group.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                </h5>
                                <p className="text-white/90 text-sm">
                                  {new Date(group.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold text-sm">
                                {group.slots.length} Slot{group.slots.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Time Slots Grid */}
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {group.slots.map((slot, idx) => (
                              <div key={idx} className="relative group">
                                <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                  slot.booked_count > 0 
                                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                    : 'bg-white border-gray-200 hover:border-irisBlueColor hover:shadow-md'
                                }`}>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                      <svg className={`w-4 h-4 ${slot.booked_count > 0 ? 'text-blue-600' : 'text-primaryColor'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <p className="text-base font-bold text-headingColor">
                                        {formatTime(slot.time)}
                                      </p>
                                    </div>
                                    {slot.booked_count > 0 ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-center gap-1">
                                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                          </svg>
                                          <span className="text-xs font-semibold text-blue-700">
                                            {slot.booked_count} Patient{slot.booked_count !== 1 ? 's' : ''}
                                          </span>
                                        </div>
                                        <div className="flex justify-center gap-0.5">
                                          {[...Array(4)].map((_, i) => (
                                            <div
                                              key={i}
                                              className={`w-1.5 h-1.5 rounded-full ${
                                                i < slot.booked_count ? 'bg-blue-600' : 'bg-gray-300'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                        Available
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDeleteSlot(slot.date, slot.time)}
                                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-lg"
                                  title="Delete slot"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Appointments Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellowColor to-primaryColor flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-headingColor">Appointments</h3>
                  <p className="text-sm text-textColor">Your upcoming patient appointments</p>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-textColor">No appointments scheduled yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-primaryColor/10 to-yellowColor/10">
                        <th className="px-6 py-4 text-left text-sm font-bold text-headingColor">Patient</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-headingColor">Contact</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-headingColor">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-headingColor">Time</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-headingColor">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-headingColor">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {appointments.map((appt) => (
                        <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primaryColor to-yellowColor flex items-center justify-center text-white font-semibold">
                                {appt.patient_name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-headingColor">{appt.patient_name}</p>
                                <p className="text-xs text-textColor">{appt.patient_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-textColor">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="text-sm">{appt.patient_phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-textColor">{appt.date}</td>
                          <td className="px-6 py-4 text-textColor">{appt.time}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              appt.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                              appt.status === 'treated' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {appt.status === 'booked' && (
                              <button
                                onClick={() => setShowFormId(appt._id)}
                                className="px-4 py-2 bg-primaryColor hover:bg-primaryColor/90 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                              >
                                Write Prescription
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Prescription Form */}
            {showFormId && (
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purpleColor to-irisBlueColor flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-headingColor">Write Prescription</h4>
                    <p className="text-sm text-textColor">Add treatment details for the patient</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-headingColor mb-2">Medical Notes</label>
                    <textarea
                      rows="4"
                      placeholder="Enter diagnosis, observations, or additional notes..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purpleColor focus:ring-2 focus:ring-purpleColor/20 outline-none transition-all resize-none"
                      onChange={(e) => setPrescriptionForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-headingColor mb-2">Medicines</label>
                    <textarea
                      rows="4"
                      placeholder="Enter medicines separated by commas (e.g., Paracetamol 500mg, Amoxicillin 250mg)"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purpleColor focus:ring-2 focus:ring-purpleColor/20 outline-none transition-all resize-none"
                      onChange={(e) =>
                        setPrescriptionForm((prev) => ({
                          ...prev,
                          medicines: e.target.value.split(',').map((m) => ({ name: m.trim() }))
                        }))
                      }
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => handlePrescribe(showFormId)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purpleColor to-irisBlueColor text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Submit Prescription
                  </button>
                  <button 
                    onClick={() => setShowFormId(null)}
                    className="px-6 py-3 bg-gray-100 text-headingColor font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

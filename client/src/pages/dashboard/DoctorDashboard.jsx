import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorDashboard = () => {
  const [specialization, setSpecialization] = useState('');
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionForm, setPrescriptionForm] = useState({});
  const [showFormId, setShowFormId] = useState(null);

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
    } catch (err) {
      console.error('Failed to update specialization:', err);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.time) return alert('Both date and time are required.');

    try {
      const res = await axios.post('/api/doctor/slots', newSlot, { headers });
      setSlots(res.data.available_slots);
      setNewSlot({ date: '', time: '' });
    } catch (err) {
      console.error('Failed to add slot:', err);
    }
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
              </div>
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
                  <h3 className="text-xl font-bold text-headingColor">Available Slots</h3>
                  <p className="text-sm text-textColor">Manage your appointment schedule</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input 
                  type="date" 
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all"
                />
                <input 
                  type="time" 
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all"
                />
                <button 
                  onClick={handleAddSlot}
                  className="px-6 py-3 bg-gradient-to-r from-irisBlueColor to-primaryColor text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                >
                  Add Slot
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {slots.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-irisBlueColor/10 to-primaryColor/10 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <svg className="w-5 h-5 text-primaryColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-headingColor">{slot.date}</p>
                        <p className="text-sm text-textColor">{slot.time}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteSlot(slot.date, slot.time)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
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
                              <span className="font-semibold text-headingColor">{appt.patient_name}</span>
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

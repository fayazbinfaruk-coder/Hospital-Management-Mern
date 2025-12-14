
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorDashboard = () => {
  const [specialization, setSpecialization] = useState('');
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionForm, setPrescriptionForm] = useState({}); // prescription form states
  const [showFormId, setShowFormId] = useState(null); // controls which appointment form is shown

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
    <div className="container">
      <h2 className="heading mt-[30px]">Doctor Dashboard</h2>
      {loading ? (
        <p className="text_para mt-5">Loading...</p>
      ) : (
        <>
          {/* Specialization Dropdown */}
          <div className="my-6">
            <label className="block mb-2 font-semibold">Specialization:</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="border p-2 rounded w-full max-w-md"
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
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              Save Specialization
            </button>
          </div>

          {/* Slots */}
          <div className="my-6">
            <h3 className="font-bold mb-2">Available Slots</h3>
            <div className="flex gap-2 mb-2">
              <input type="date" value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                className="border p-2 rounded" />
              <input type="time" value={newSlot.time}
                onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                className="border p-2 rounded" />
              <button onClick={handleAddSlot}
                className="bg-green-600 text-white px-4 py-2 rounded">Add Slot</button>
            </div>
            <ul className="list-disc pl-5">
              {slots.map((slot, index) => (
                <li key={index} className="mb-1">
                  {slot.date} at {slot.time}
                  <button onClick={() => handleDeleteSlot(slot.date, slot.time)}
                    className="ml-4 text-sm text-red-600 hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Appointments */}
          <div className="my-6">
            <h3 className="font-bold mb-2">Appointments</h3>
            {appointments.length === 0 ? (
              <p>No appointments yet.</p>
            ) : (
              <table className="min-w-full border text-center">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Patient Name</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Time</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt._id}>
                      <td className="p-2 border">{appt.patient_name}</td>
                      <td className="p-2 border">{appt.date}</td>
                      <td className="p-2 border">{appt.time}</td>
                      <td className="p-2 border">{appt.status}</td>
                      <td className="p-2 border">
                        {appt.status === 'booked' && (
                          <button
                            onClick={() => setShowFormId(appt._id)}
                            className="text-blue-600 underline"
                          >
                            Write Prescription
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Prescription Form */}
          {showFormId && (
            <div className="border p-5 rounded bg-gray-50 mt-6">
              <h4 className="text-lg font-bold mb-2">Write Prescription</h4>
              <textarea
                rows="3"
                placeholder="Notes (optional)"
                className="w-full border p-2 mb-3"
                onChange={(e) => setPrescriptionForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
              <textarea
                rows="3"
                placeholder="Medicines (comma separated)"
                className="w-full border p-2 mb-3"
                onChange={(e) =>
                  setPrescriptionForm((prev) => ({
                    ...prev,
                    medicines: e.target.value.split(',').map((m) => ({ name: m.trim() }))
                  }))
                }
              />
              <button onClick={() => handlePrescribe(showFormId)}
                className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Submit</button>
              <button onClick={() => setShowFormId(null)}
                className="text-gray-600 hover:underline">Cancel</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;

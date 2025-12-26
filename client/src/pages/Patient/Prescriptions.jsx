import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPrescription, setExpandedPrescription] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users/prescriptions', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      if (typeof res.data === 'string') {
        throw new Error('API returned HTML. Check if backend is running on port 5000.');
      }

      const list = Array.isArray(res.data?.prescriptions) ? res.data.prescriptions : [];
      setPrescriptions(list);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load prescriptions';
      setError(message);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'N/A';

  const getStatusColor = (status) =>
    status === 'completed'
      ? 'bg-green-100 text-green-700'
      : status === 'pending'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-blue-100 text-blue-700';

  const getStatusBadge = (status) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {(status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1)}
    </span>
  );

  const downloadPrescription = async (id) => {
    try {
      const res = await axios.get(`/api/users/prescriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      const prescription = res.data.prescription;
      const content = `Prescription for ${prescription?.doctor_id?.name || 'Doctor'} on ${formatDate(prescription?.date)}`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription_${id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to download prescription');
    }
  };

  // Guaranteed UI (never blank)
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container max-w-6xl mx-auto text-center py-12">
          <p className="text-gray-600 text-lg">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            ❌ {error}
          </div>
        </div>
      </div>
    );
  }

  if (!prescriptions.length) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container max-w-6xl mx-auto text-center py-12">
          <div className="bg-blue-50 border border-blue-200 text-gray-600 p-8 rounded-lg">
            <p className="text-lg">No prescriptions yet.</p>
            <p className="text-sm mt-2">Your prescriptions from doctors will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Page Header */}
      <div className="container max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Prescriptions</h1>
        <p className="text-gray-600">View all your medical prescriptions, medicines, and tests</p>
      </div>

      {/* Prescriptions List */}
      <div className="container max-w-6xl mx-auto space-y-4">
        {prescriptions.map((p) => (
          <div
            key={p._id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 border border-gray-100"
          >
            {/* Header - Clickable */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setExpandedPrescription(expandedPrescription === p._id ? null : p._id)}
            >
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{p.doctor_id?.name || 'Doctor Prescription'}</h3>
                <p className="text-sm text-gray-500 mt-1">{formatDate(p.date)}</p>
              </div>
              <div className="text-gray-400">
                {expandedPrescription === p._id ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedPrescription === p._id && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-3">
                {/* Status & Doctor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Status</p>
                    <p>{getStatusBadge(p.status || 'pending')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Doctor</p>
                    <p className="text-gray-600">{p.doctor_id?.name || 'N/A'}</p>
                  </div>
                </div>

                {/* Notes Section */}
                {p.notes && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{p.notes}</p>
                  </div>
                )}

                {/* Prescribed Medicines */}
                {p.medicines && p.medicines.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Prescribed Medicines</h4>
                    <div className="space-y-3">
                      {p.medicines.map((med, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                          {/* Medicine Name */}
                          <p className="font-semibold text-sm text-gray-800 mb-2">
                            {med.medicine_id?.drugName || med.name || 'Unknown Medicine'}
                          </p>

                          {/* Dosage & Duration */}
                          <div className="flex gap-4 mb-3">
                            {med.dosage && (
                              <span className="text-xs text-gray-600">
                                <strong>Dosage: </strong>
                                {med.dosage}
                              </span>
                            )}
                            {med.duration && (
                              <span className="text-xs text-gray-600">
                                <strong>Duration: </strong>
                                {med.duration}
                              </span>
                            )}
                          </div>

                          {/* Timing Badges */}
                          {med.timing &&
                            (med.timing.morning !== 0 ||
                              med.timing.noon !== 0 ||
                              med.timing.night !== 0) && (
                              <div className="flex gap-2 flex-wrap">
                                {med.timing.morning !== 0 && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1 font-medium">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Morning {med.timing.morning} tablet
                                    {med.timing.morning !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {med.timing.noon !== 0 && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1 font-medium">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Noon {med.timing.noon} tablet
                                    {med.timing.noon !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {med.timing.night !== 0 && (
                                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full flex items-center gap-1 font-medium">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                    Night {med.timing.night} tablet
                                    {med.timing.night !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Tests */}
                {p.tests && p.tests.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Recommended Tests</h4>
                    <div className="space-y-2">
                      {p.tests.map((test, idx) => (
                        <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{test.name || test}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download Button */}
                <button
                  onClick={() => downloadPrescription(p._id)}
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 font-semibold"
                >
                  <FiDownload size={18} />
                  Download Prescription
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prescriptions;
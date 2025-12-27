import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const DonorDashboard = () => {
  const [available, setAvailable] = useState(false);
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bloodRequests, setBloodRequests] = useState([]);
  const [showAllRequests, setShowAllRequests] = useState(false);

  const [confirmingId, setConfirmingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  const token = localStorage.getItem('token');

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/donor/dashboard', { headers });
      setAvailable(Boolean(res.data.available));
      setDonationHistory(res.data.donation_history || []);
    } catch (err) {
      console.error('Failed to load donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/donor/requests', { headers });
      const data = Array.isArray(res.data) ? res.data : [];
      setBloodRequests(data);
    } catch (err) {
      console.error('Failed to load blood requests:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchDashboard();
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggleAvailability = async () => {
    try {
      const res = await axios.patch('/api/donor/availability', {}, { headers });
      setAvailable(Boolean(res.data.available));
      // refresh list; some backends restrict requests when not active
      await fetchRequests();
    } catch (err) {
      console.error('Failed to update availability:', err);
      alert(err?.response?.data?.message || 'Failed to update availability');
    }
  };

  const confirmRequest = async (id) => {
    try {
      setConfirmingId(id);
      await axios.patch(`/api/blood/accept/${id}`, {}, { headers });
      alert('Request confirmed successfully.');
      await fetchRequests();
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to confirm request:', err);
      alert(err?.response?.data?.message || 'Failed to confirm request');
    } finally {
      setConfirmingId(null);
    }
  };

  const completeDonation = async (id) => {
    try {
      setCompletingId(id);
      await axios.patch(`/api/donor/complete/${id}`, {}, { headers });
      alert('Marked as completed.');
      await fetchRequests();
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to complete donation:', err);
      alert(err?.response?.data?.message || 'Failed to complete donation');
    } finally {
      setCompletingId(null);
    }
  };

  const visibleRequests = useMemo(() => {
    if (showAllRequests) return bloodRequests;
    return bloodRequests.slice(0, 3);
  }, [bloodRequests, showAllRequests]);

  const formatDateTime = (value) => {
    if (!value) return '-';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleString();
    } catch {
      return String(value);
    }
  };

  const StatusBadge = ({ status }) => {
    const s = String(status || '').trim().toLowerCase();
    const cls =
      s === 'requested'
        ? 'bg-yellow-100 text-yellow-800'
        : s === 'accepted'
        ? 'bg-blue-100 text-blue-800'
        : s === 'completed'
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-700';

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm text-gray-600 font-semibold">{label}</p>
      <p className="text-sm text-gray-800 text-right break-words max-w-[65%]">
        {value ?? '-'}
      </p>
    </div>
  );

  return (
    <div className="container">
      <h2 className="heading mt-[30px]">Blood Donor Dashboard</h2>

      {!token ? (
        <p className="text_para mt-5">Please login again.</p>
      ) : loading ? (
        <p className="text_para mt-5">Loading...</p>
      ) : (
        <>
          {/* Toggle Availability */}
          <div className="my-6">
            <h3 className="font-semibold text-lg mb-2">Availability</h3>
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded font-semibold ${
                available ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
              }`}
            >
              {available ? 'Active - Available to Donate' : 'Inactive - Not Available'}
            </button>
            {!available && (
              <p className="text-sm text-gray-500 mt-2">
                Turn on availability to view and confirm requests.
              </p>
            )}
          </div>

          {/* Incoming Blood Requests */}
          <div className="my-6">
            <details open className="border rounded-xl shadow-sm bg-white">
              <summary className="cursor-pointer select-none px-4 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Incoming Blood Requests</h3>
                  <p className="text-sm text-gray-500">
                    Showing {Math.min(3, bloodRequests.length)} of {bloodRequests.length}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  {bloodRequests.length}
                </span>
              </summary>

              <div className="px-4 pb-4">
                {bloodRequests.length === 0 ? (
                  <p>No requests at this time.</p>
                ) : (
                  <>
                    <ul className="space-y-3 mt-2">
                      {visibleRequests.map((req) => {
                        const patient = req.patient || req.patient_snapshot || {};
                        const status = String(req.status || '').trim().toLowerCase();

                        const isRequested = status === 'requested';
                        const isMyAccepted =
                          status === 'accepted' &&
                          String(req.donor_id) === String(req.current_user_id);

                        return (
                          <li key={req._id} className="border rounded-xl overflow-hidden">
                            <details className="bg-white">
                              <summary className="cursor-pointer select-none px-4 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {patient?.name || req.patient_name || 'Patient'}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    Blood: {req.blood_type || '-'} • Location: {req.location || '-'}
                                  </p>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  {isRequested && (
                                    <button
                                      type="button"
                                      disabled={!available || confirmingId === req._id}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        confirmRequest(req._id);
                                      }}
                                      className="bg-blue-600 text-white px-3 py-2 rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {confirmingId === req._id ? 'Confirming...' : 'Confirm'}
                                    </button>
                                  )}

                                  <StatusBadge status={req.status} />
                                </div>
                              </summary>

                              <div className="px-4 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                                  {/* Patient Info */}
                                  <div className="space-y-2">
                                    <p className="text-sm font-bold text-gray-900">Patient Information</p>
                                    <InfoRow label="Name" value={patient.name || req.patient_name || '-'} />
                                    <InfoRow label="Phone" value={patient.phone || req.patient_phone || '-'} />
                                    <InfoRow label="Email" value={patient.email || req.patient_email || '-'} />
                                    <InfoRow label="Age" value={patient.age ?? req.patient_age ?? '-'} />
                                    <InfoRow label="Gender" value={patient.gender || req.patient_gender || '-'} />
                                    <InfoRow label="Address" value={patient.address || req.patient_address || '-'} />
                                  </div>

                                  {/* Request Info */}
                                  <div className="space-y-2">
                                    <p className="text-sm font-bold text-gray-900">Request Details</p>
                                    <InfoRow label="Blood type" value={req.blood_type || '-'} />
                                    <InfoRow label="Location" value={req.location || '-'} />
                                    <InfoRow label="Hospital" value={req.hospital || req.hospital_name || '-'} />
                                    <InfoRow label="Units / Quantity" value={req.units ?? req.quantity ?? '-'} />
                                    <InfoRow
                                      label="Needed by"
                                      value={req.needed_by ? formatDateTime(req.needed_by) : (req.needed_date || req.required_date || '-')}
                                    />
                                    <InfoRow label="Note" value={req.note || '-'} />
                                    <InfoRow label="Created at" value={formatDateTime(req.createdAt || req.created_at)} />
                                    <InfoRow label="Request ID" value={req._id} />
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  {isRequested && (
                                    <button
                                      disabled={!available || confirmingId === req._id}
                                      onClick={() => confirmRequest(req._id)}
                                      className="bg-blue-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {confirmingId === req._id ? 'Confirming...' : 'Confirm'}
                                    </button>
                                  )}

                                  {isMyAccepted && (
                                    <button
                                      disabled={completingId === req._id}
                                      onClick={() => completeDonation(req._id)}
                                      className="bg-green-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {completingId === req._id ? 'Saving...' : 'Mark as Completed'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </details>
                          </li>
                        );
                      })}
                    </ul>

                    {bloodRequests.length > 3 && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowAllRequests((p) => !p)}
                          className="px-4 py-2 rounded font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
                        >
                          {showAllRequests ? 'Show less' : 'Show all requests'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </details>
          </div>

          {/* Donation History */}
          <div className="my-6">
            <h3 className="font-semibold text-lg mb-2">Donation History</h3>
            {donationHistory.length === 0 ? (
              <p>No donation records yet.</p>
            ) : (
              <ul className="list-disc pl-5">
                {donationHistory.map((date, index) => (
                  <li key={index}>{date}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DonorDashboard;

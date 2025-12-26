import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapWrapper from '../../components/Map';

const DriverDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/driver/dashboard', { headers });
        setPendingRequests(res.data.pending_requests);
        setAssignedRequests(res.data.assigned_requests);
        setCompletedCount(res.data.completed_requests);
        // fetch driver profile for location
        try {
          const prof = await axios.get('/api/driver/profile', { headers });
          setDriverProfile(prof.data.driver);
        } catch (e) {
          console.warn('Could not fetch driver profile', e?.response?.data || e.message);
        }
      } catch (err) {
        console.error('Failed to load driver dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleAccept = async (id) => {
    try {
      await axios.patch(`/api/driver/accept/${id}`, {}, { headers });
      window.location.reload();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleProposeFare = async (id) => {
    const fare = prompt('Enter your proposed fare:');
    if (!fare || isNaN(fare)) return alert('Please enter a valid fare.');
    try {
      await axios.post(`/api/driver/propose-fare/${id}`, { fare }, { headers });
      window.location.reload();
    } catch (err) {
      console.error('Failed to propose fare:', err);
    }
  };

  const handleStartProcessing = async (id) => {
    try {
      await axios.patch(`/api/driver/start-processing/${id}`, {}, { headers });
      window.location.reload();
    } catch (err) {
      console.error('Failed to start processing:', err);
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.patch(`/api/driver/complete/${id}`, {}, { headers });
      window.location.reload();
    } catch (err) {
      console.error('Failed to complete request:', err);
    }
  };

  return (
    <div className="container">
      <h2 className="heading mt-[30px]">Ambulance Driver Dashboard</h2>

      {loading ? (
        <p className="text_para mt-5">Loading...</p>
      ) : (
        <>
          {/* ✅ Completed counter */}
          <div className="my-5 text_para">
            <strong>Total Completed Requests:</strong> {completedCount}
          </div>

          {/* ✅ Pending Requests Section */}
          <div className="my-6">
            {/* Map showing pending request pickups and your location */}
            <div className="mb-4">
              <MapWrapper
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                center={driverProfile?.current_lat && driverProfile?.current_lng ? { lat: driverProfile.current_lat, lng: driverProfile.current_lng } : (pendingRequests[0]?.pickup_lat && pendingRequests[0]?.pickup_lng ? { lat: pendingRequests[0].pickup_lat, lng: pendingRequests[0].pickup_lng } : { lat: 23.8103, lng: 90.4125 })}
                zoom={12}
                markers={[
                  ...pendingRequests.map(r => r.pickup_lat && r.pickup_lng ? { position: { lat: r.pickup_lat, lng: r.pickup_lng }, title: r.pickup_location } : null).filter(Boolean),
                  ...(driverProfile?.current_lat && driverProfile?.current_lng ? [{ position: { lat: driverProfile.current_lat, lng: driverProfile.current_lng }, title: 'You' }] : [])
                ]}
              />
            </div>
            <h3 className="font-semibold text-lg mb-2">Pending Ambulance Requests</h3>
            {pendingRequests.length === 0 ? (
              <p>No pending requests.</p>
            ) : (
              <ul className="space-y-3">
                {pendingRequests.map((req) => (
                  <li key={req._id} className="border p-3 rounded">
                    <p><strong>Patient:</strong> {req.patient_id?.name}</p>
                    <p><strong>Pickup:</strong> {req.pickup_location}</p>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleProposeFare(req._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Propose Fare
                      </button>
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Accept
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ✅ Assigned/Completed Requests Section */}
          <div className="my-6">
            <h3 className="font-semibold text-lg mb-2">Your Assigned Requests</h3>
            {assignedRequests.length === 0 ? (
              <p>You haven't accepted any requests yet.</p>
            ) : (
              <ul className="space-y-3">
                {assignedRequests.map((req) => (
                  <li key={req._id} className="border p-3 rounded">
                    <p><strong>Patient:</strong> {req.patient_id?.name}</p>
                    <p><strong>Pickup:</strong> {req.pickup_location}</p>
                    <p><strong>Status:</strong> {req.status}</p>
                    {req.status === 'accepted' && (
                      <button
                        onClick={() => handleStartProcessing(req._id)}
                        className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded"
                      >
                        Start Processing
                      </button>
                    )}
                    {req.status === 'processing' && (
                      <button
                        onClick={() => handleComplete(req._id)}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DriverDashboard;

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PrescriptionPayment from '../../components/PrescriptionPayment/PrescriptionPayment';

const Prescriptions = () => {
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-headingColor mb-2">My Prescriptions</h2>
          <p className="text-textColor">View and manage your prescriptions</p>
        </div>
        
        <PrescriptionPayment appointmentId={appointmentId} />
      </div>
    </div>
  );
};

export default Prescriptions;
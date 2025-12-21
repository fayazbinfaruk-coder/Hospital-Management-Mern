import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database/connectDB.js';


import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import bloodRoutes from './routes/bloodRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

dotenv.config();
connectDB(); 

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/appointment', appointmentRoutes);



app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import "dotenv/config";

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import formRoutes from './routes/forms.js';
import responseRoutes from './routes/responses.js';
import { connectDB } from './config/db.js';

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', async (req, res) => {

  await connectDB();
  
  const healthStatus = {
    status: 'UP',
    timestamp: new Date(),
    services: {
      server: 'UP',
      database: 'DOWN',
    },
  };

  try {
    const dbState = mongoose.connection.readyState;

    if (dbState === 1) {
      healthStatus.services.database = 'UP';
      await mongoose.connection.db.admin().ping();
    } else {
      healthStatus.status = 'DOWN';
      healthStatus.services.database = 'DEGRADED';
    }

    return res.status(healthStatus.status === 'UP' ? 200 : 503).json(healthStatus);
  } catch (error) {
    healthStatus.status = 'DOWN';
    healthStatus.services.database = 'ERROR';
    healthStatus.error = error.message;
    return res.status(503).json(healthStatus);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

export default app;

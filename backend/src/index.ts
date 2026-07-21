import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './config/logger';

import authRoutes from './routes/authRoutes';
import baseRoutes from './routes/baseRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import transferRoutes from './routes/transferRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import expenditureRoutes from './routes/expenditureRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Morgan HTTP request logger hooked to Winston
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Swagger API Documentation
setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/bases', baseRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

import * as workerController from '../controllers/workerController.js';
import express from 'express';
import { requireAuth } from './authRoutes.js';

const workerRoutes = express.Router();

// Valid Admin
workerRoutes.use(requireAuth);

workerRoutes.get('/all', workerController.fetchAllWorkers);
workerRoutes.get('/attendance/today', workerController.fetchAttendanceToday);
workerRoutes.post('/', workerController.registerWorker);
workerRoutes.delete('/:workerId', workerController.deleteWorker);

export default workerRoutes;
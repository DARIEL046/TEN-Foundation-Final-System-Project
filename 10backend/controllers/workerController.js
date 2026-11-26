import * as workerService from '../services/workerService.js';
import * as attendanceModel from '../models/attendanceModels.js';
export const fetchAllWorkers = async (req, res) => {
    try {
        const workers = await workerService.fetchAllWorkers();
        res.status(200).json(workers);
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: e.message
        });
    }
}

/* Register */
export const registerWorker = async (req, res) => {
    const { name } = req.body;

    try {
        const worker = await workerService.registerWorker({ name });
        res.status(201).json({
            success: true,
            worker
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: e.message
        });
    }
}

/* Delete */
export const deleteWorker = async (req, res) => {
    const { workerId } = req.params;

    try {
        const message = await workerService.deleteWorker(workerId);
        res.status(200).json({
            success: true,
            message
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: e.message
        });
    }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/* 1.2.2 Attendance summary for the admin Attendance tab */
export const fetchAttendanceToday = async (req, res) => {
    try {

        const date = req.query.date ? String(req.query.date) : null;
        if (date && (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date)))) {
            return res.status(400).json({ error: "Invalid date." });
        }

        const summary = await attendanceModel.fetchTodaySummary(date);
        const rows = await attendanceModel.fetchToday(date);

        // No Time Out = IN, has Time Out = OUT
        const records = rows.map((r) => ({
            ...r,
            status: r.timeOut ? 'OUT' : 'IN'
        }));

        res.status(200).json({ success: true, ...summary, records });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};
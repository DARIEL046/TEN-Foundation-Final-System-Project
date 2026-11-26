import pool from '../config/db.js';

const COLUMNS = `a.id, a.worker_id AS workerId, w.name, a.time_in AS timeIn, a.time_out AS timeOut`;
const FROM = `attendance a JOIN worker w ON w.worker_id = a.worker_id`;

export const findOpenSessionToday = async (workerId) => {
    const [rows] = await pool.query(
        `SELECT id FROM attendance
         WHERE worker_id = ? AND DATE(time_in) = CURDATE() AND time_out IS NULL
         ORDER BY id DESC LIMIT 1`,
        [workerId]
    );
    return rows[0] || null;
};

export const findRecentEvent = async (workerId) => {
    const [rows] = await pool.query(
        `SELECT id FROM attendance
         WHERE worker_id = ?
           AND GREATEST(time_in, COALESCE(time_out, time_in)) > (NOW() - INTERVAL 1 MINUTE)
         LIMIT 1`,
        [workerId]
    );
    return rows[0] || null;
};

export const insertTimeIn = async (workerId) => {
    const [result] = await pool.query(
        'INSERT INTO attendance(worker_id, time_in) VALUES (?, NOW())',
        [workerId]
    );
    return result.insertId;
};

export const setTimeOut = async (id) => {
    const [result] = await pool.query(
        'UPDATE attendance SET time_out = NOW() WHERE id = ? AND time_out IS NULL',
        [id]
    );
    return result.affectedRows;
};

export const findById = async (id) => {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM ${FROM} WHERE a.id = ?`, [id]);
    return rows[0] || null;
};

export const fetchToday = async (date = null) => {
    const [rows] = await pool.query(
        `SELECT ${COLUMNS} FROM ${FROM}
         WHERE DATE(a.time_in) = DATE(COALESCE(?, CURDATE()))
         ORDER BY COALESCE(a.time_out, a.time_in) DESC, a.id DESC`,
        [date]
    );
    return rows;
};


// Today's record for this worker (the one Time In / Time Out pair)
export const findTodayRecord = async (workerId) => {
    const [rows] = await pool.query(
        `SELECT id, time_out AS timeOut FROM attendance
         WHERE worker_id = ? AND DATE(time_in) = CURDATE()
         ORDER BY id DESC LIMIT 1`,
        [workerId]
    );
    return rows[0] || null;
};


// 1.2.2 Attendance summary for today
export const fetchTodaySummary = async (date = null) => {
    const [[counts]] = await pool.query(
        `SELECT
            (SELECT COUNT(*) FROM worker) AS registeredWorkers,
            COUNT(*) AS totalSessions,
            COALESCE(SUM(time_out IS NULL), 0) AS activeNow
         FROM attendance
         WHERE DATE(time_in) = DATE(COALESCE(?, CURDATE()))`,
        [date]
    );

    return {
        registeredWorkers: Number(counts.registeredWorkers),
        activeNow: Number(counts.activeNow),
        totalSessions: Number(counts.totalSessions),
    };
};
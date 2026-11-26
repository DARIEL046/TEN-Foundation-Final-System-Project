import { loadWorkers } from "./workerStorage";
import { loadTodayRecords } from "./attendanceStorage";

const dayKey = (value) => new Date(value).toLocaleDateString("en-CA");

export const getAttendanceSummary = () => {
  // Retrieve registered workers from localStorage
  const workers = loadWorkers();
  const today = dayKey(new Date());

  // Retrieve attendance records from localStorage, keep only today's
  const records = loadTodayRecords()
    .filter((r) => r.timeIn && dayKey(r.timeIn) === today)
    // No Time Out = IN, has Time Out = OUT
    .map((r) => ({ ...r, status: r.timeOut ? "OUT" : "IN" }));

  return {
    registeredWorkers: workers.length,
    activeNow: records.filter((r) => r.status === "IN").length,
    totalSessions: records.length,
    records,
  };
};
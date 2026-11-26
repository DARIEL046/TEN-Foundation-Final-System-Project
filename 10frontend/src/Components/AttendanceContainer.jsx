import { useEffect, useState } from "react";
import { fetchAttendanceToday } from "../api/workerApi";
import { getAttendanceSummary } from "../utils/attendanceSummary";
import "../attendance.css";

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })
    : "—";

const formatDate = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const todayKey = () => new Date().toLocaleDateString("en-CA");

const EMPTY_SUMMARY = { registeredWorkers: 0, activeNow: 0, totalSessions: 0, records: [] };
const AttendanceContainer = () => {

      const [selectedDate, setSelectedDate] = useState(todayKey);

  // Show what is saved in this browser right away
  const [summary, setSummary] = useState(getAttendanceSummary);
  const [notice, setNotice] = useState("");

    const isToday = selectedDate === todayKey();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchAttendanceToday(isToday ? undefined : selectedDate);
        if (cancelled) return;
        setSummary(data);
        setNotice("");
      } catch (e) {
        if (cancelled) return;
        if (isToday) {
          setSummary(getAttendanceSummary());
          setNotice(`${e.message} Showing activity saved in this browser.`);
        } else {
          setSummary(EMPTY_SUMMARY);
          setNotice(e.message);
        }
      }
    };

    load();

    const timer = isToday ? setInterval(load, 10000) : null;
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [selectedDate, isToday]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value || todayKey());
  };

  const { registeredWorkers, activeNow, totalSessions, records } = summary;

  return (
    <>
      {notice && <p className="notice">{notice}</p>}

      <section className="att-stats">
        <div className="att-stat">
          <span className="att-stat-value">{registeredWorkers}</span>
          <span className="att-stat-label">Registered Workers</span>
        </div>
        <div className="att-stat att-stat-active">
          <span className="att-stat-value">{activeNow}</span>
          <span className="att-stat-label">{isToday ? "Active Right Now" : "No Time Out"}</span>
        </div>
        <div className="att-stat">
          <span className="att-stat-value">{totalSessions}</span>
          <span className="att-stat-label">{isToday ? "Total Sessions Today" : "Total Sessions"}</span>
        </div>
      </section>

            <div className="list-head att-head">
        <h2>{isToday ? "Today's activity" : "Activity"}</h2>
        <span className="list-count">{formatDate(selectedDate)}</span>

        <div className="att-date">
          <label htmlFor="attendanceDate">Date</label>
          <input
            type="date"
            id="attendanceDate"
            value={selectedDate}
            max={todayKey()}
            onChange={handleDateChange}
          />
          {!isToday && (
            <button type="button" className="att-today-btn" onClick={() => setSelectedDate(todayKey())}>
              Today
            </button>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <p className="empty-list">
  {isToday ? "No attendance recorded yet today." : "No attendance recorded on this date."}
</p>
      ) : (
        <div className="att-table-card">
          <table className="att-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="att-name">{r.name}</span>
                    <span className="att-id">{r.workerId}</span>
                  </td>
                  <td>{formatTime(r.timeIn)}</td>
                  <td>{formatTime(r.timeOut)}</td>
                  <td>
                    <span className={`att-badge att-badge-${r.status === "IN" ? "in" : "out"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AttendanceContainer;
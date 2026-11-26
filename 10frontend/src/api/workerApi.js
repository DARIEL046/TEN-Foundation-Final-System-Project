import { API_URL, getToken, clearToken } from "../utils/auth";

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Can't reach the server. Make sure the backend is running on port 3000.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Missing or expired
    if (response.status === 401) {
      clearToken();
      window.location.assign("/signin");
    }
    const error = new Error(data.error || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
};

export const fetchWorkers = () => request("/worker/all");

export const registerWorker = (name) =>
  request("/worker", { method: "POST", body: JSON.stringify({ name }) });

export const deleteWorker = (workerId) =>
  request(`/worker/${encodeURIComponent(workerId)}`, { method: "DELETE" });

export const fetchAttendanceToday = (date) =>
  request(date ? `/worker/attendance/today?date=${encodeURIComponent(date)}` : "/worker/attendance/today");
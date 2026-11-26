/* DARIEL */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkerHeaderContainer from "../Components/WorkerHeaderContainer";
import WorkerFormContainer from "../Components/WorkerFormContainer";
import WorkerListContainer from "../Components/WorkerListContainer";
import { fetchWorkers, registerWorker, deleteWorker } from "../api/workerApi";
import { clearToken } from "../utils/auth";
import AttendanceContainer from "../Components/AttendanceContainer";
import {
  loadWorkers,
  saveWorkers,
  normalizeName,
  qrMatchesWorker,
} from "../utils/workerStorage";

const WorkerPage = () => {
  const navigate = useNavigate();

  // Show the workers saved in localStorage right away
  const [workers, setWorkers] = useState(loadWorkers);
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("qr");

  // ADD - ADMIN - QR
  const [query, setQuery] = useState("");

  // Then refresh the list from the backend once
  useEffect(() => {
    fetchWorkers()
      .then((result) => {
        const valid = result.filter(qrMatchesWorker);
        setWorkers(valid);
        saveWorkers(valid);
      })
      .catch((e) => {
        setNotice(`${e.message} Showing workers saved in this browser.`);
      });
  }, []);


  // ADDED - ADMIN - QR
  // Search by worker name or worker ID (case-insensitive)
  const visibleWorkers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workers;
    return workers.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        String(w.workerId).toLowerCase().includes(q)
    );
  }, [workers, query]);

  // Throws an Error with a readable message if registration fails
  const handleRegister = async (name) => {
    const duplicate = workers.find(
      (w) => normalizeName(w.name) === normalizeName(name)
    );
    if (duplicate) {
      throw new Error(
        `${duplicate.name} is already registered as ${duplicate.workerId}.`
      );
    }

    const { worker } = await registerWorker(name);

    if (!qrMatchesWorker(worker)) {
      throw new Error("The QR code did not match the worker. Please try again.");
    }

    const updated = [worker, ...workers];
    setWorkers(updated);
    saveWorkers(updated);
    setNotice("");
  };

  const handleDelete = async (worker) => {
    try {
      await deleteWorker(worker.workerId);
    } catch (e) {
      // 404 because the server no longer has this worker
      if (e.status !== 404) {
        setNotice(e.message);
        return;
      }
    }

    const updated = workers.filter((w) => w.workerId !== worker.workerId);
    setWorkers(updated);
    saveWorkers(updated);
    setNotice("");
  };

  const handleLogout = () => {
    clearToken();
    saveWorkers([]); // clear the worker list cached in this browser
    navigate("/signin", { replace: true });
  };

  return (
    <div className="admin">
      <WorkerHeaderContainer
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNavigate={(path) => navigate(path)}
        onLogout={handleLogout}
      />
      <main className="admin-content">
        {activeTab === "qr" ? (
          <>
        <WorkerFormContainer
          onRegister={handleRegister}
          query={query}
          onQueryChange={setQuery}
        />
        <WorkerListContainer
          workers={visibleWorkers}
          total={workers.length}
          query={query}
          notice={notice}
          onDelete={handleDelete}
        />
        </>
        ) : (
          <AttendanceContainer />
        )}
      </main>
    </div>
  );
};

export default WorkerPage;
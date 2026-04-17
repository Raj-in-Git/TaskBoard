import React, { useState, useEffect, useMemo } from "react";
import "./TasksTable.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../api/axios";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { BarChart, Bar } from "recharts";
import * as XLSX from "xlsx";

function UpdateTable() {
  const [updates, setUpdates] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ taskID: "", updates: "", efforts: "" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dateRange, setDateRange] = useState([today, today]);
  const [startDate, endDate] = dateRange;
  const [viewMode, setViewMode] = useState("weekly");

  // -----------------------------
  // FETCH DATA
  // -----------------------------
  const fetchUpdates = () => {
    API.get("/updates/")
      .then(res => setUpdates(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUpdates([]));
  };

  const fetchTasks = () => {
    API.get("/tasks/")
      .then(res => {
        const active = res.data.filter(t => t.status === "Active");
        setActiveTasks(active);
      })
      .catch(() => setActiveTasks([]));
  };

  useEffect(() => {
    fetchUpdates();
    fetchTasks();
  }, []);

  // -----------------------------
  // FILTER
  // -----------------------------
  const filteredUpdates = useMemo(() => {
    return updates.filter(item => {
      const d = new Date(item.date);

      if (!startDate || !endDate) return true;

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return d >= start && d <= end;
    });
  }, [updates, startDate, endDate]);

  // -----------------------------
  // KPI
  // -----------------------------
  const totalEffort = filteredUpdates.reduce(
    (sum, item) => sum + Number(item.efforts || 0),
    0
  );

  const remainingEffort = Math.max(8 - totalEffort, 0);

  const data = [
    { name: "Completed", value: totalEffort },
    { name: "Remaining", value: remainingEffort }
  ];

  const COLORS = ["#4caf50", "#e0e0e0"];
  const percent = Math.min((totalEffort / 8) * 100, 100).toFixed(0);

  // -----------------------------
  // CHART DATA
  // -----------------------------
  const trendData = useMemo(() => {
    const grouped = {};

    updates.forEach(item => {
      const date = new Date(item.date);
      const key =
        viewMode === "weekly"
          ? date.toISOString().split("T")[0]
          : `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += Number(item.efforts || 0);
    });

    return Object.keys(grouped).map(key => ({
      date: key,
      effort: grouped[key]
    }));
  }, [updates, viewMode]);

  const projectData = useMemo(() => {
    const grouped = {};

    filteredUpdates.forEach(item => {
      const key = item.task || "Unknown";
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += Number(item.efforts || 0);
    });

    return Object.keys(grouped).map(k => ({
      project: k,
      effort: grouped[k]
    }));
  }, [filteredUpdates]);

  // -----------------------------
  // ADD UPDATE
  // -----------------------------
  const handleSubmitUpdate = async () => {
    try {
      await API.post("/updates/", newUpdate);

      setShowForm(false);
      setNewUpdate({ taskID: "", updates: "", efforts: "" });

      fetchUpdates();
    } catch {
      alert("Error adding update");
    }
  };
// -----------------------------
// DATE FORMAT FUNCTION
// -----------------------------
const formatDate = (dateString) => {
  if (!dateString) return "-";

  const d = new Date(dateString);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const sec = String(d.getSeconds()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd} ${hh}:${min}:${sec}`;
};
  // -----------------------------
  // EXPORT
  // -----------------------------
  const formatDateForFile = (date) => {
  if (!date) return "";
  const d = new Date(date);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd}`;
};

const exportToExcel = () => {
  const data = filteredUpdates.map((item, i) => ({
    "Sl. No": i + 1,
    "Date": formatDate(item.date),
    "Project": item.project || "-",
    "Task": item.task,
    "Update": item.update,
    "Effort (hrs)": item.efforts
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Updates");

  // ✅ Dynamic file name
  let fileName = "TaskBoard";

  if (startDate && endDate) {
    const start = formatDateForFile(startDate);
    const end = formatDateForFile(endDate);

    fileName += start === end
      ? `_${start}`
      : `_${start}_to_${end}`;
  }

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="dashboard">
      <div className="filter-bar">
        <div className="date-filter">
          <label>Select Date:</label>

          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            className="date-input"
          />

          <button
            className="today-btn"
            onClick={() => setDateRange([new Date(), new Date()])}
          >
            Today
          </button>
        </div>

      <button onClick={exportToExcel} className="export-btn">
        📊 Export
      </button>
    </div>

  {/* ---------------- CARDS GRID ---------------- */}
  <div className="charts-grid">
    {/* HEATMAP */}
    <div className="chart-card">
      <h4>Productivity Heatmap</h4>
      <div className="heatmap">
        {Object.entries(
          updates.reduce((acc, item) => {
            const d = item.date?.split("T")[0];
            if (!acc[d]) acc[d] = 0;
            acc[d] += Number(item.efforts || 0);
            return acc;
          }, {})
        ).map(([date, effort]) => (
          <div
            key={date}
            className="heat-cell"
            style={{
              backgroundColor:
                effort > 6 ? "#2e7d32" :
                effort > 4 ? "#66bb6a" :
                effort > 2 ? "#a5d6a7" :
                "#e8f5e9"
            }}
            title={`${date}: ${effort} hrs`}
          />
        ))}
      </div>
    </div>

    <div className="chart-card center-card">
  <h4>Daily Effort</h4>

  <div className="donut-wrapper">
    <PieChart width={200} height={200}>
      <Pie
        data={data}
        dataKey="value"
        innerRadius={60}   // ✅ makes donut
        outerRadius={80}
        paddingAngle={3}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>

    {/* CENTER TEXT */}
    <div className="donut-center">
      {percent}%
    </div>
  </div>
</div>

    {/* BAR */}
    <div className="chart-card">
      <h4>Task-wise Effort</h4>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={projectData}>
          <XAxis dataKey="project" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="effort" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* LINE */}
    <div className="chart-card">
      <h4>Trend</h4>

      <div>
        <button onClick={() => setViewMode("weekly")}>Weekly</button>
        <button onClick={() => setViewMode("monthly")}>Monthly</button>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="effort" stroke="#1976d2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </div>
  {/* ---------------- TABLE ---------------- */}
  <button className="add-btn" onClick={() => setShowForm(true)}>
  + Add Update
</button>

  <table>
  <thead>
    <tr>
      <th>Time</th>
      <th>Project</th>
      <th>Task</th>
      <th>Update</th>
      <th>Effort</th>
    </tr>
  </thead>

  <tbody>
    {filteredUpdates.map((u) => (
      <tr key={u.id}>
        <td>{formatDate(u.date)}</td>
        <td>{u.project || "-"}</td>
        <td>{u.task}</td>
        <td>{u.update}</td>
        <td>{u.efforts}</td>
      </tr>
    ))}
  </tbody>
</table>
      {/* Add updates */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Update</h2>
            <div className="form-group">
              <label>Task</label>
              <select
                value={newUpdate.taskID}
                onChange={(e) =>
                  setNewUpdate({ ...newUpdate, taskID: e.target.value })
                }
              >
                <option value="">Select Task</option>
                {activeTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.taskname}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Update</label>
              <textarea
                placeholder="Describe what you worked on..."
                onChange={(e) =>
                  setNewUpdate({ ...newUpdate, updates: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Effort (hours)</label>
              <input
                type="number"
                placeholder="e.g. 2"
                onChange={(e) =>
                  setNewUpdate({ ...newUpdate, efforts: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSubmitUpdate}>Save</button>
              <button  className="cancel-btn"  onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateTable;
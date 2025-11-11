import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("todo_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ text: "", date: "", time: "", priority: "medium" });
  const [toast, setToast] = useState("");

  // persist
  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // helper: priority weight
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  // sorted view (priority first, then datetime)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // combine date + time; if missing date treat as far future
    const dateA = a.date ? new Date(`${a.date}T${a.time || "00:00"}`) : new Date(8640000000000000);
    const dateB = b.date ? new Date(`${b.date}T${b.time || "00:00"}`) : new Date(8640000000000000);
    return dateA - dateB;
  });

  const resetForm = () => setForm({ text: "", date: "", time: "", priority: "medium" });

  const addTask = () => {
    if (!form.text.trim()) return;
    const newTask = {
      id: Date.now(),
      ...form,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    resetForm();
    setShowForm(false);
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, completed: !t.completed };
          // show toast only when marking completed (not when unchecking)
          if (!t.completed && updated.completed) {
            setToast(`🎉 Congratulations — "${t.text}" completed`);
            setTimeout(() => setToast(""), 1800);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const removeTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="app-wrap">
      <header className="app-header">
        <h1>TodoList</h1>
        <p className="subtitle">Lavender theme • Priority + date/time • Click dot to complete</p>
      </header>

      <main>
        <ul className="task-list">
          {sortedTasks.length === 0 && <li className="empty">No tasks yet — click + to add</li>}
          {sortedTasks.map((task) => (
            <li key={task.id} className={`task-row ${task.completed ? "task-completed" : ""}`}>
              <div className="left" onClick={() => toggleComplete(task.id)}>
                <div className={`dot ${task.completed ? "dot-done" : ""}`}>
                  {task.completed ? "✔" : ""}
                </div>
                <div className="task-text-block">
                  <div className="task-title">{task.text}</div>
                  <div className="task-meta">
                    {task.date ? task.date : ""}
                    {task.time ? ` ${task.time}` : ""}
                    {task.priority ? ` • ${task.priority}` : ""}
                  </div>
                </div>
              </div>

              <div className="actions">
                <button className="del" onClick={() => removeTask(task.id)} aria-label="delete">✖</button>
              </div>
            </li>
          ))}
        </ul>
      </main>

      {/* FAB */}
      <button className="fab" onClick={() => setShowForm(true)} aria-label="add">
        +
      </button>

      {/* Popup form */}
      {showForm && (
        <div className="popup-back" onClick={() => setShowForm(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add task</h3>
            <input
              placeholder="Task name"
              value={form.text}
              onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
            />
            <div className="row">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              />
            </div>
            <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>

            <div className="form-actions">
              <button className="btn add" onClick={addTask}>Add</button>
              <button className="btn cancel" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

import { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        credentials: "include",
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load tasks.");
        return;
      }

      setTasks(data.tasks);
    } catch (error) {
      setError("Unable to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData) => {
    const isEditing = editingTask !== null;

    const url = isEditing
      ? `${API_BASE_URL}/api/tasks/${editingTask.id}`
      : `${API_BASE_URL}/api/tasks`;

    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(taskData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save task.");
    }

    if (isEditing) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === data.task.id ? data.task : task
        )
      );
    } else {
      setTasks((currentTasks) => [data.task, ...currentTasks]);
    }

    setShowForm(false);
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to delete task.");
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      alert("Unable to connect to the backend server.");
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus =
      task.status === "Completed" ? "Pending" : "Completed";

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...task,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update task.");
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? data.task : currentTask
        )
      );
    } catch (error) {
      alert("Unable to connect to the backend server.");
    }
  };

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "High"
  ).length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    return task.status === filter;
  });

  const openNewTaskForm = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="small-logo">✓</div>
          <div>
            <h1>TaskFlow</h1>
            <span>Organize your work. Achieve more.</span>
          </div>
        </div>

        <div className="user-section">
          <div className="user-info">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>

          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h2>Hello, {user.name.split(" ")[0]} 👋</h2>
            <p>Stay focused and keep your tasks moving forward.</p>
          </div>

          <button className="primary-button" onClick={openNewTaskForm}>
            + Add New Task
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Tasks</span>
            <strong>{totalTasks}</strong>
            <p>Everything on your list</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <strong>{pendingTasks}</strong>
            <p>Tasks waiting for you</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">Completed</span>
            <strong>{completedTasks}</strong>
            <p>Great work so far</p>
          </div>

          <div className="stat-card">
            <span className="stat-label">High Priority</span>
            <strong>{highPriorityTasks}</strong>
            <p>Needs your attention</p>
          </div>
        </section>

        <section className="tasks-section">
          <div className="tasks-header">
            <div>
              <h2>My Tasks</h2>
              <p>Manage and track your daily work.</p>
            </div>

            <div className="filter-buttons">
              {["All", "Pending", "Completed"].map((filterName) => (
                <button
                  key={filterName}
                  className={
                    filter === filterName ? "filter active" : "filter"
                  }
                  onClick={() => setFilter(filterName)}
                >
                  {filterName}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="message error-message">{error}</div>}

          {loading ? (
            <div className="loading-tasks">
              <div className="spinner"></div>
              <p>Loading your tasks...</p>
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onAddTask={openNewTaskForm}
            />
          )}
        </section>
      </main>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onClose={closeForm}
        />
      )}
    </div>
  );
}

export default Dashboard;
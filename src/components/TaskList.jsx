function TaskList({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddTask,
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✓</div>
        <h3>No tasks found</h3>
        <p>
          You don't have any tasks in this category yet. Create one and get
          started!
        </p>
        <button className="primary-button" onClick={onAddTask}>
          + Create Your First Task
        </button>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article
          className={`task-card ${
            task.status === "Completed" ? "completed" : ""
          }`}
          key={task.id}
        >
          <button
            className={`status-toggle ${
              task.status === "Completed" ? "checked" : ""
            }`}
            onClick={() => onToggleStatus(task)}
            title={
              task.status === "Completed"
                ? "Mark as pending"
                : "Mark as completed"
            }
          >
            {task.status === "Completed" ? "✓" : ""}
          </button>

          <div className="task-main">
            <div className="task-top">
              <h3>{task.title}</h3>

              <span
                className={`priority-badge ${task.priority.toLowerCase()}`}
              >
                {task.priority}
              </span>
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            <div className="task-meta">
              <span
                className={
                  task.status === "Completed"
                    ? "status completed-status"
                    : "status pending-status"
                }
              >
                {task.status}
              </span>

              {task.due_date && (
                <span>Due: {task.due_date}</span>
              )}
            </div>
          </div>

          <div className="task-actions">
            <button onClick={() => onEdit(task)}>Edit</button>
            <button
              className="delete-action"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default TaskList;
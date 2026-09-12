import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { createTask, deleteTask, getTasks, updateTask } from "../api/taskApi";

const columns = [
  {
    key: "todo",
    title: "To Do",
    description: "Tasks waiting to be started",
  },
  {
    key: "in-progress",
    title: "In Progress",
    description: "Tasks currently being worked on",
  },
  {
    key: "done",
    title: "Done",
    description: "Completed tasks",
  },
];

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const loadBoard = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectResponse, taskResponse] = await Promise.all([
        api.get(`/projects/${projectId}`),
        getTasks(projectId),
      ]);

      setProject(projectResponse.data.project);
      setTasks(taskResponse.tasks || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load project board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, [projectId]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingTask) {
        const data = await updateTask(editingTask._id, formData);

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task._id === editingTask._id ? data.task : task,
          ),
        );
      } else {
        const data = await createTask({
          ...formData,
          projectId,
        });

        setTasks((currentTasks) => [data.task, ...currentTasks]);
      }

      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save task");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div className="board-page">
        <Navbar />
        <div className="board-loading">
          <div className="loader"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="board-page">
      <Navbar />

      <main className="board-content">
        <div className="board-header">
          <div>
            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← My Projects
            </button>

            <p className="eyebrow">PROJECT BOARD</p>

            <h1>{project?.name}</h1>

            <p className="board-description">
              {project?.description || "No project description provided."}
            </p>
          </div>

          <button
            className="create-project-button"
            onClick={() => {
              setEditingTask(null);
              setFormData({
                title: "",
                description: "",
              });
              setShowForm(true);
            }}
          >
            + Add Task
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <section className="task-form-card">
            <div className="form-heading">
              <h2>{editingTask ? "Edit Task" : "Create a new task"}</h2>
              <p>
                {editingTask
                  ? "Update your task details."
                  : "Add a task to your project board."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="task-title">Task Title</label>

                <input
                  id="task-title"
                  type="text"
                  name="title"
                  placeholder="e.g. Build login page"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="task-description">Description</label>

                <textarea
                  id="task-description"
                  name="description"
                  placeholder="Describe the task..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="task-form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button type="submit" className="submit-project-button">
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="board">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.key,
            );

            return (
              <div className="board-column" key={column.key}>
                <div className="column-header">
                  <div>
                    <h2>{column.title}</h2>
                    <p>{column.description}</p>
                  </div>

                  <span className="task-count">{columnTasks.length}</span>
                </div>

                <div className="task-list">
                  {columnTasks.length === 0 ? (
                    <div className="empty-column">
                      <span>+</span>
                      <p>No tasks yet</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <article className="task-card" key={task._id}>
                        <div className="task-card-header">
                          <h3>{task.title}</h3>

                          <div className="task-actions">
                            <button onClick={() => handleEdit(task)}>
                              Edit
                            </button>

                            <button onClick={() => handleDelete(task._id)}>
                              Delete
                            </button>
                          </div>
                        </div>

                        {task.description && <p>{task.description}</p>}

                        <div className="task-card-footer">
                          <span>
                            {task.assignedTo
                              ? task.assignedTo.name
                              : "Unassigned"}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default ProjectBoard;

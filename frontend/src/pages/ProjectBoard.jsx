import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/projects/${projectId}`);
      setProject(response.data.project);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

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

  if (error) {
    return (
      <div className="board-page">
        <Navbar />
        <main className="board-content">
          <div className="error-message">{error}</div>
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </main>
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

          <div className="board-member-count">
            <strong>{project?.members?.length || 0}</strong>
            <span>Members</span>
          </div>
        </div>

        <section className="board">
          {columns.map((column) => (
            <div className="board-column" key={column.key}>
              <div className="column-header">
                <div>
                  <h2>{column.title}</h2>
                  <p>{column.description}</p>
                </div>

                <span className="task-count">0</span>
              </div>

              <div className="task-list">
                <div className="empty-column">
                  <span>+</span>
                  <p>No tasks yet</p>
                </div>
              </div>

              <button className="add-task-button">+ Add Task</button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ProjectBoard;

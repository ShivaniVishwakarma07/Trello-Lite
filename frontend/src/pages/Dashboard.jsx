import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { createProject, getProjects } from "../api/projectApi";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const data = await createProject(formData);

      setProjects((currentProjects) => [data.project, ...currentProjects]);

      setFormData({
        name: "",
        description: "",
      });

      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-content">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">WORKSPACE</p>
            <h1>My Projects</h1>
            <p className="dashboard-subtitle">
              Organize your work, manage tasks, and keep projects moving.
            </p>
          </div>

          <button
            className="create-project-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Create Project"}
          </button>
        </section>

        {showForm && (
          <section className="project-form-card">
            <div className="form-heading">
              <h2>Create a new project</h2>
              <p>Set up a workspace for your next project.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="name">Project Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g. Website Redesign"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="What is this project about?"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <button className="submit-project-button" type="submit">
                Create Project
              </button>
            </form>
          </section>
        )}

        {error && <div className="error-message">{error}</div>}

        <section className="projects-section">
          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">+</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <article className="project-card" key={project._id}>
                  <div className="project-card-top">
                    <div className="project-icon">
                      {project.name?.charAt(0).toUpperCase()}
                    </div>

                    <span className="project-status">Active</span>
                  </div>

                  <h3>{project.name}</h3>

                  <p>{project.description || "No description provided."}</p>

                  <div className="project-card-footer">
                    <span>
                      {project.members?.length || 0} member
                      {(project.members?.length || 0) !== 1 ? "s" : ""}
                    </span>

                    <button className="open-project-button">Open →</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

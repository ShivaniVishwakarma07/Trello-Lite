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
      const data = await getProjects();
      setProjects(data.projects);
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
    <div>
      <Navbar />

      <main>
        <div>
          <h1>My Projects</h1>

          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create Project"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Project name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Project description"
              value={formData.description}
              onChange={handleChange}
            />

            <button type="submit">Create</button>
          </form>
        )}

        {error && <p>{error}</p>}

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects yet. Create your first project.</p>
        ) : (
          <div>
            {projects.map((project) => (
              <div key={project._id}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <p>Members: {project.members?.length || 0}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

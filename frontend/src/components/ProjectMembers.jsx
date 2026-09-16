import { useEffect, useState } from "react";
import {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} from "../api/memberApi";

const ProjectMembers = ({ projectId, isOwner }) => {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getProjectMembers(projectId);
      setMembers(data.members || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadMembers();
    }
  }, [projectId]);

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setError("");
      setMessage("");

      const data = await addProjectMember(projectId, {
        email: email.trim(),
        role,
      });

      setMembers(data.members || members);
      setEmail("");
      setRole("member");
      setMessage("Member added successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add member");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError("");
      setMessage("");

      const data = await updateMemberRole(projectId, userId, newRole);

      setMembers(data.members || members);
      setMessage("Member role updated");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update member role");
    }
  };

  const handleRemove = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const data = await removeProjectMember(projectId, userId);

      setMembers(data.members || members);
      setMessage("Member removed successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) {
    return <div className="members-panel">Loading members...</div>;
  }

  return (
    <section className="members-panel">
      <div className="members-header">
        <div>
          <p className="section-label">TEAM</p>
          <h2>Project Members</h2>
        </div>

        <span className="members-count">{members.length}</span>
      </div>

      {error && <p className="members-message error">{error}</p>}
      {message && <p className="members-message success">{message}</p>}

      {isOwner && (
        <form className="member-add-form" onSubmit={handleAddMember}>
          <input
            type="email"
            placeholder="Enter member email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
          </select>

          <button type="submit">Add Member</button>
        </form>
      )}

      <div className="members-list">
        {members.length === 0 ? (
          <p className="empty-members">No project members yet.</p>
        ) : (
          members.map((member) => (
            <div className="member-row" key={member.user._id}>
              <div className="member-info">
                <strong>{member.user.name}</strong>
                <span>{member.user.email}</span>
              </div>

              <div className="member-actions">
                <select
                  value={member.role}
                  disabled={!isOwner}
                  onChange={(event) =>
                    handleRoleChange(member.user._id, event.target.value)
                  }
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                </select>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleRemove(member.user._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ProjectMembers;

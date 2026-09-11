import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">T</div>
        <div>
          <h2>Trello Lite</h2>
          <span>Project Management</span>
        </div>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;

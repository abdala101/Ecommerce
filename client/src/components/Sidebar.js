import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ setToken }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token"); // remove token
    setToken(null);                   // clear state
    navigate("/login");               // redirect to login page
  };

  return (
    <div
      style={{
        width: "220px",
        background: "#222",
        color: "white",
        height: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div>
        <h2>Admin</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Analytics</Link>
          <Link to="/products" style={{ color: "#9ca3af", textDecoration: "none" }}>Products</Link>
          <Link to="/orders" style={{ color: "#9ca3af", textDecoration: "none" }}>Orders</Link>
        </nav>
      </div>

      {/* ✅ Logout button at bottom */}
      <button
        onClick={logout}
        style={{
          background: "red",
          color: "white",
          border: "none",
          padding: "8px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
}

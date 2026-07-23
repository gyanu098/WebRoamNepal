import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import MessagesIcon from "./MessagesIcon";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isMinimal =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    (location.pathname === "/" && !isAuthenticated);

  if (isMinimal) {
    return (
      <header className="nav-bar">
        <div className="brand">Roam Nepal</div>
      </header>
    );
  }

  const baseLinks = [{ to: "/", label: "Home" }];

  const guestLinks = [
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
  ];

  const authedLinks = [
    { to: "/favorites", label: "Favorites" },
    { to: "/profile", label: "Profile" },
  ];
  if (role === "admin") {
    authedLinks.push({ to: "/user", label: "Admin" });
  }

  const links = [...baseLinks, ...(isAuthenticated ? authedLinks : guestLinks)];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="nav-bar">
      <div className="brand">Roam Nepal</div>
      <nav className="nav-links" aria-label="Primary navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
        {isAuthenticated && (
          <button type="button" className="nav-link nav-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
        <MessagesIcon />
        <NotificationBell />
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
        active ? "bg-black/[0.06] text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-black/[0.04]"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/[0.06]">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-[15px] tracking-tight text-gray-900">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white text-[11px] font-bold">
            A
          </span>
          AI Study Buddy
        </Link>

        {user && (
          <div className="flex items-center gap-1">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/flashcards">Flashcards</NavLink>

            <div className="w-px h-5 bg-black/[0.08] mx-2" />

            <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-[12px] font-semibold flex items-center justify-center">
              {initial}
            </div>
            <button
              onClick={handleLogout}
              className="ml-1 px-3 py-1.5 rounded-full text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-black/[0.04] transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

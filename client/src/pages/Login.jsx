import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px] animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-600 mx-auto mb-5 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-black/10">
            A
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-gray-900">Welcome back</h1>
          <p className="text-[15px] text-gray-500 mt-1">Log in to continue studying</p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full px-3.5 py-2.5 text-[15px] text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full px-3.5 py-2.5 text-[15px] text-gray-900"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 rounded-lg px-3 py-2 animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5 text-[15px] disabled:opacity-40"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-[14px] text-gray-500 mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-gray-900 font-medium hover:underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

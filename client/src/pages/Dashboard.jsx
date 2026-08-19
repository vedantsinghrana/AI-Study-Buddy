import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import api from "../api/axios";

function accuracyColor(accuracy) {
  if (accuracy < 50) return "#dc2626";
  if (accuracy < 75) return "#d97706";
  return "#16a34a";
}

export default function Dashboard() {
  const [topics, setTopics] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/analytics/weak-topics"), api.get("/analytics/score-trend")])
      .then(([topicsRes, trendRes]) => {
        setTopics(topicsRes.data.topics);
        setTrend(trendRes.data.attempts.map((a, i) => ({ ...a, label: `#${i + 1}` })));
      })
      .catch((err) => setError(err.response?.data?.error || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500 text-center mt-10">Loading...</p>;
  if (error) return <p className="text-sm text-red-600 text-center mt-10">{error}</p>;

  if (!topics || topics.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-4">
          Take a quiz on one of your documents to start seeing analytics here.
        </p>
        <Link to="/" className="text-sm text-gray-900 font-medium">
          &larr; Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Accuracy by topic</h2>
        <div className="border border-gray-200 rounded-lg p-4" style={{ height: Math.max(240, topics.length * 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topics} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="topic" width={140} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                {topics.map((t) => (
                  <Cell key={t.topic} fill={accuracyColor(t.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {trend && trend.length > 1 && (
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Score trend</h2>
          <div className="border border-gray-200 rounded-lg p-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.documentTitle || label}
                />
                <Line type="monotone" dataKey="percentage" stroke="#111827" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}

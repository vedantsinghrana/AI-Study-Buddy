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
import { PageLoader } from "../components/Spinner";

function accuracyColor(accuracy) {
  if (accuracy < 50) return "#ef4444";
  if (accuracy < 75) return "#f59e0b";
  return "#22c55e";
}

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "none",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    fontSize: 13,
    padding: "8px 12px",
  },
  labelStyle: { color: "#6b7280", marginBottom: 2 },
};

export default function Dashboard() {
  const [topics, setTopics] = useState(null);
  const [trend, setTrend] = useState(null);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/analytics/weak-topics"),
      api.get("/analytics/score-trend"),
      api.get("/flashcards/due"),
    ])
      .then(([topicsRes, trendRes, dueRes]) => {
        setTopics(topicsRes.data.topics);
        setTrend(trendRes.data.attempts.map((a, i) => ({ ...a, label: `#${i + 1}` })));
        setDueCount(dueRes.data.cards.length);
      })
      .catch((err) => setError(err.response?.data?.error || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <p className="text-[14px] text-red-600 text-center mt-10">{error}</p>;

  const dueBanner = dueCount > 0 && (
    <Link
      to="/flashcards"
      className="card-surface flex items-center justify-between px-5 py-4 mb-8 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
          </svg>
        </div>
        <span className="text-[14px] text-gray-700">
          <span className="font-semibold text-gray-900">{dueCount}</span> flashcard
          {dueCount === 1 ? "" : "s"} due for review
        </span>
      </div>
      <span className="text-[14px] font-medium text-gray-900">Review now &rarr;</span>
    </Link>
  );

  if (!topics || topics.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 text-center animate-fade-in-up">
        <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 mb-6">Dashboard</h1>
        {dueBanner}
        <p className="text-[14px] text-gray-500 mb-4">
          Take a quiz on one of your documents to start seeing analytics here.
        </p>
        <Link to="/" className="text-[14px] text-gray-900 font-medium hover:underline underline-offset-2">
          &larr; Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 animate-fade-in-up">
      <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 mb-8">Dashboard</h1>

      {dueBanner}

      <section className="mb-10">
        <h2 className="text-[13px] font-medium text-gray-500 mb-3">Accuracy by topic</h2>
        <div className="card-surface p-5" style={{ height: Math.max(240, topics.length * 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topics} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="topic" width={140} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value}%`} {...tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="accuracy" radius={[0, 8, 8, 0]} maxBarSize={22}>
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
          <h2 className="text-[13px] font-medium text-gray-500 mb-3">Score trend</h2>
          <div className="card-surface p-5" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.documentTitle || label}
                  {...tooltipStyle}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#2f6fed"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#2f6fed", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}

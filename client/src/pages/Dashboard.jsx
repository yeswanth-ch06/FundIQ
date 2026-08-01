import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { FiBriefcase, FiFileText, FiDollarSign, FiBell } from "react-icons/fi";
import { fetchDashboardThunk } from "../redux/slices/notificationSlice.js";
import StatCard from "../components/StatCard.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const currency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboard, status } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchDashboardThunk());
  }, [dispatch]);

  if (status === "loading" || !dashboard) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, chart, role } = dashboard;

  const chartData = {
    labels: chart?.labels || [],
    datasets: [
      {
        label: "Activity",
        data: chart?.counts || [],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.1)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your account.</p>
      </div>

      {/* Stat cards — shape depends on role, since a founder and an admin care about different numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === "admin" ? (
          <>
            <StatCard label="Total users" value={stats.totalUsers} icon={FiBriefcase} />
            <StatCard label="Total startups" value={stats.totalStartups} icon={FiFileText} accent="emerald" />
            <StatCard label="Applications" value={stats.totalApplications} icon={FiBell} accent="amber" />
          </>
        ) : ["investor", "venture_capital", "angel_investor"].includes(role) ? (
          <>
            <StatCard label="Startups available" value={stats.startupsAvailable} icon={FiBriefcase} />
            <StatCard label="Applications received" value={stats.applicationsReceived} icon={FiFileText} accent="emerald" />
          </>
        ) : (
          <>
            <StatCard label="My startups" value={stats.startupCount} icon={FiBriefcase} />
            <StatCard label="Applications submitted" value={stats.applicationsSubmitted} icon={FiFileText} accent="emerald" />
            <StatCard label="Funding sought" value={currency(stats.totalFundingSought)} icon={FiDollarSign} accent="amber" />
            <StatCard label="Unread notifications" value={stats.unreadNotifications} icon={FiBell} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-sm font-semibold mb-4">Activity — last 6 months</h2>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-sm font-semibold mb-4">My startups</h2>
          {dashboard.startups?.length ? (
            <ul className="space-y-3">
              {dashboard.startups.slice(0, 5).map((s) => (
                <li key={s._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{s.stage?.replace("_", " ")}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === "published"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No startups yet — create your first one to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

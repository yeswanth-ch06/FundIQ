import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiUsers, FiBriefcase, FiBarChart2, FiList } from "react-icons/fi";
import * as adminService from "../../services/adminService.js";

const TABS = [
  { key: "users", label: "Users", icon: FiUsers },
  { key: "startups", label: "Startups", icon: FiBriefcase },
  { key: "reports", label: "Reports", icon: FiBarChart2 },
  { key: "logs", label: "Logs", icon: FiList },
];

const ROLES = [
  "student", "entrepreneur", "startup_founder", "researcher", "investor",
  "venture_capital", "angel_investor", "incubator", "accelerator",
  "government", "university", "admin",
];

const AdminPanel = () => {
  const [tab, setTab] = useState("users");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, startups, and platform activity.</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-800 p-1 w-fit mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm transition ${
              tab === key ? "bg-brand-600 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "startups" && <StartupsTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "logs" && <LogsTab />}
    </div>
  );
};

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = () => {
    setLoading(true);
    adminService.getUsers(q ? { q } : {}).then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStatus = async (user) => {
    try {
      await adminService.setUserStatus(user._id, !user.isActive);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u)));
      toast.success(user.isActive ? "User suspended" : "User activated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  const changeRole = async (user, role) => {
    try {
      await adminService.setUserRole(user._id, role);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role } : u)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search by name or email..."
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm flex-1 max-w-xs"
        />
        <button onClick={load} className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          Search
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {u.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(u)} className="text-xs font-medium text-brand-600 hover:underline">
                      {u.isActive ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StartupsTab = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  const load = () => {
    setLoading(true);
    adminService.getAllStartups().then(({ data }) => setStartups(data.startups)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id) => {
    try {
      await adminService.deleteStartupAsAdmin(id);
      setStartups((prev) => prev.filter((s) => s._id !== id));
      toast.success("Startup removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove startup");
    }
    setConfirmId(null);
  };

  if (loading) return <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />)}</div>;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs text-gray-500">
          <tr>
            <th className="px-4 py-3">Startup</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {startups.map((s) => (
            <tr key={s._id} className="border-t border-gray-100 dark:border-gray-800">
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3 text-gray-500">{s.owner?.name}</td>
              <td className="px-4 py-3">{s.status}</td>
              <td className="px-4 py-3">
                {confirmId === s._id ? (
                  <button onClick={() => remove(s._id)} className="text-xs font-medium text-red-600">Confirm delete?</button>
                ) : (
                  <button onClick={() => setConfirmId(s._id)} className="text-xs font-medium text-red-500 hover:underline">Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportsTab = () => {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    adminService.getReports().then(({ data }) => setReports(data));
  }, []);

  if (!reports) return <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />;

  const Section = ({ title, data }) => (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-sm font-semibold mb-3">{title}</p>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d._id} className="flex justify-between text-sm">
            <span className="text-gray-500 capitalize">{(d._id || "unknown").replace("_", " ")}</span>
            <span className="font-medium">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Section title="Users by role" data={reports.usersByRole} />
      <Section title="Startups by stage" data={reports.startupsByStage} />
      <Section title="Startups by industry" data={reports.startupsByIndustry} />
      <Section title="Applications by status" data={reports.applicationsByStatus} />
    </div>
  );
};

const LogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getLogs().then(({ data }) => setLogs(data.logs)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />)}</div>;
  if (logs.length === 0) return <p className="text-sm text-gray-400">No admin actions logged yet.</p>;

  return (
    <div className="space-y-2">
      {logs.map((l) => (
        <div key={l._id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm">
          <div>
            <span className="font-medium">{l.admin?.name}</span>
            <span className="text-gray-500"> — {l.action.replace(/_/g, " ")}</span>
            {l.details && <span className="text-gray-400"> ({l.details})</span>}
          </div>
          <span className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;

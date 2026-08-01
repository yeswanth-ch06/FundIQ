import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiGrid, FiBriefcase, FiFileText, FiTarget, FiTrendingUp, FiBell,
  FiUser, FiMessageCircle, FiCheckSquare, FiAward, FiUsers, FiShield,
} from "react-icons/fi";

const INVESTOR_ROLES = ["investor", "venture_capital", "angel_investor"];

const BASE_NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: FiGrid, end: true },
  { to: "/dashboard/startups", label: "My Startups", icon: FiBriefcase },
  { to: "/dashboard/proposals", label: "Proposals", icon: FiFileText },
  { to: "/dashboard/funding", label: "Funding Matches", icon: FiTarget },
  { to: "/dashboard/applications", label: "Applications", icon: FiCheckSquare },
  { to: "/dashboard/messages", label: "Messages", icon: FiMessageCircle },
  { to: "/dashboard/notifications", label: "Notifications", icon: FiBell },
  { to: "/dashboard/profile", label: "Profile", icon: FiUser },
];

// Role-specific portal links, inserted right after "Overview".
const ROLE_PORTAL = {
  investor: { to: "/dashboard/investor-portal", label: "Investor Portal", icon: FiTrendingUp },
  venture_capital: { to: "/dashboard/investor-portal", label: "Investor Portal", icon: FiTrendingUp },
  angel_investor: { to: "/dashboard/investor-portal", label: "Investor Portal", icon: FiTrendingUp },
  government: { to: "/dashboard/government-portal", label: "Government Portal", icon: FiAward },
  university: { to: "/dashboard/university-portal", label: "University Portal", icon: FiUsers },
  admin: { to: "/dashboard/admin", label: "Admin Panel", icon: FiShield },
};

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const portalLink = ROLE_PORTAL[user?.role];

  const navItems = portalLink
    ? [BASE_NAV_ITEMS[0], portalLink, ...BASE_NAV_ITEMS.slice(1)]
    : BASE_NAV_ITEMS;

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-6">
      <div className="px-2 mb-8">
        <span className="text-lg font-semibold tracking-tight">FundingIQ</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

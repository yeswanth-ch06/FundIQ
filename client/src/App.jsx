import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchMeThunk } from "./redux/slices/authSlice.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import StartupList from "./pages/startups/StartupList.jsx";
import StartupForm from "./pages/startups/StartupForm.jsx";
import ProposalList from "./pages/proposals/ProposalList.jsx";
import ProposalForm from "./pages/proposals/ProposalForm.jsx";
import ProposalDetail from "./pages/proposals/ProposalDetail.jsx";
import FundingRecommendations from "./pages/funding/FundingRecommendations.jsx";
import InvestorPortal from "./pages/investor/InvestorPortal.jsx";
import Messages from "./pages/Messages.jsx";
import Applications from "./pages/Applications.jsx";
import GovernmentPortal from "./pages/government/GovernmentPortal.jsx";
import UniversityPortal from "./pages/university/UniversityPortal.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";

const INVESTOR_ROLES = ["investor", "venture_capital", "angel_investor"];

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt to silently restore a session on load via the refresh cookie.
    dispatch(fetchMeThunk());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/startups" element={<StartupList />} />
          <Route path="/dashboard/startups/new" element={<StartupForm />} />
          <Route path="/dashboard/startups/:id/edit" element={<StartupForm />} />
          <Route path="/dashboard/proposals" element={<ProposalList />} />
          <Route path="/dashboard/proposals/new" element={<ProposalForm />} />
          <Route path="/dashboard/proposals/:id" element={<ProposalDetail />} />
          <Route path="/dashboard/funding" element={<FundingRecommendations />} />
          <Route path="/dashboard/applications" element={<Applications />} />
          <Route path="/dashboard/messages" element={<Messages />} />
          <Route path="/dashboard/messages/:userId" element={<Messages />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={INVESTOR_ROLES} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/investor-portal" element={<InvestorPortal />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["government"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/government-portal" element={<GovernmentPortal />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["university"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/university-portal" element={<UniversityPortal />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/admin" element={<AdminPanel />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

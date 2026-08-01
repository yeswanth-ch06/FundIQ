import Startup from "../models/Startup.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Grant from "../models/Grant.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Builds a simple month-by-month count series for the last 6 months from
// a Mongo collection's createdAt field — used to power the dashboard chart.
const monthlyTrend = async (Model, match = {}) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const results = await Model.aggregate([
    { $match: { ...match, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Fill in months with zero activity so the chart has a continuous axis.
  const labels = [];
  const counts = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString("default", { month: "short" });
    const match = results.find((r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
    labels.push(label);
    counts.push(match ? match.count : 0);
  }
  return { labels, counts };
};

// @route   GET /api/analytics/dashboard
// Returns a role-appropriate summary so one endpoint can power every
// role's dashboard without over-fetching data the role can't see anyway.
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === "admin") {
    const [totalUsers, totalStartups, totalApplications, usersByRole, trend] = await Promise.all([
      User.countDocuments(),
      Startup.countDocuments(),
      Application.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      monthlyTrend(User),
    ]);

    return res.status(200).json({
      success: true,
      role: "admin",
      stats: { totalUsers, totalStartups, totalApplications },
      usersByRole,
      chart: trend,
    });
  }

  if (["investor", "venture_capital", "angel_investor"].includes(user.role)) {
    const [applicationsReceived, startupsAvailable, trend] = await Promise.all([
      Application.countDocuments(), // scoped further once investor-startup linkage ships
      Startup.countDocuments({ status: "published" }),
      monthlyTrend(Startup, { status: "published" }),
    ]);

    return res.status(200).json({
      success: true,
      role: user.role,
      stats: { applicationsReceived, startupsAvailable },
      chart: trend,
    });
  }

  if (user.role === "university") {
    const studentIds = await User.find({ role: "student" }).distinct("_id");
    const [studentStartupCount, trend] = await Promise.all([
      Startup.countDocuments({ owner: { $in: studentIds } }),
      monthlyTrend(Startup, { owner: { $in: studentIds } }),
    ]);

    return res.status(200).json({
      success: true,
      role: "university",
      stats: { totalStudents: studentIds.length, studentStartupCount },
      chart: trend,
    });
  }

  if (user.role === "government") {
    const [myGrants, applicationsToMyGrants, trend] = await Promise.all([
      Grant.countDocuments({ postedBy: user._id }),
      Application.countDocuments({ opportunityModelName: "Grant" }), // scoped further once per-grant linkage is queried directly
      monthlyTrend(Grant, { postedBy: user._id }),
    ]);

    return res.status(200).json({
      success: true,
      role: "government",
      stats: { myGrants, applicationsToMyGrants },
      chart: trend,
    });
  }

  // Default: founder / entrepreneur / student / researcher — anyone who owns startups.
  const [myStartups, myApplications, unreadNotifications, trend] = await Promise.all([
    Startup.find({ owner: user._id }).select("name stage fundingSought fundingRaisedToDate status viewCount"),
    Application.countDocuments({ applicant: user._id }),
    Notification.countDocuments({ user: user._id, isRead: false }),
    monthlyTrend(Startup, { owner: user._id }),
  ]);

  const totalFundingSought = myStartups.reduce((sum, s) => sum + (s.fundingSought || 0), 0);
  const totalFundingRaised = myStartups.reduce((sum, s) => sum + (s.fundingRaisedToDate || 0), 0);

  res.status(200).json({
    success: true,
    role: user.role,
    stats: {
      startupCount: myStartups.length,
      applicationsSubmitted: myApplications,
      totalFundingSought,
      totalFundingRaised,
      unreadNotifications,
    },
    startups: myStartups,
    chart: trend,
  });
});

// @route   GET /api/analytics/recent-activity
export const getRecentActivity = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(8);
  res.status(200).json({ success: true, activity: notifications });
});

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load server/.env by resolving relative to this file's own location — not
// the current working directory — so `npm run seed` or `node seed.js` run
// from inside this folder both work the same way.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import User from "../models/User.js";
import Startup from "../models/Startup.js";
import Proposal from "../models/Proposal.js";
import Investor from "../models/Investor.js";
import FundingOpportunity from "../models/FundingOpportunity.js";
import Grant from "../models/Grant.js";
import Incubator from "../models/Incubator.js";
import Application from "../models/Application.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";
import Bookmark from "../models/Bookmark.js";
import Analytics from "../models/Analytics.js";
import AdminLog from "../models/Admin.js";

// Every mock user shares this password so you can log in as any of them
// while testing. bcrypt hashing happens automatically via User's pre-save hook.
const MOCK_PASSWORD = "Password123";

const conversationId = (a, b) => [String(a), String(b)].sort().join("_");

const log = (msg) => console.log(`  ${msg}`);

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      "MONGO_URI is not set. Make sure server/.env exists and contains MONGO_URI=...\n" +
      `(Looked for it at: ${path.resolve(__dirname, "../.env")})`
    );
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected: ${mongoose.connection.host}\n`);

  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Startup.deleteMany({}),
    Proposal.deleteMany({}),
    Investor.deleteMany({}),
    FundingOpportunity.deleteMany({}),
    Grant.deleteMany({}),
    Incubator.deleteMany({}),
    Application.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
    Message.deleteMany({}),
    Bookmark.deleteMany({}),
    Analytics.deleteMany({}),
    AdminLog.deleteMany({}),
  ]);

  // ---------------------------------------------------------------------
  // Users — one representative account per role, all sharing MOCK_PASSWORD
  // ---------------------------------------------------------------------
  console.log("\nCreating users...");
  const usersData = [
    { name: "Aisha Khan", email: "founder1@demo.io", role: "startup_founder", organization: "Solara Health", location: "Austin, TX", bio: "Building AI-powered diagnostics for rural clinics." },
    { name: "Marcus Webb", email: "founder2@demo.io", role: "entrepreneur", organization: "GreenLoop", location: "Portland, OR", bio: "Circular economy logistics for e-commerce returns." },
    { name: "Priya Raman", email: "founder3@demo.io", role: "startup_founder", organization: "PayBridge", location: "Bengaluru, IN", bio: "Cross-border payments for SMEs in emerging markets." },
    { name: "Tomas Novak", email: "student1@demo.io", role: "student", organization: "MIT", location: "Cambridge, MA", bio: "Robotics grad student prototyping agricultural drones." },
    { name: "Elena Ruiz", email: "researcher1@demo.io", role: "researcher", organization: "Stanford Bioengineering", location: "Palo Alto, CA", bio: "Synthetic biology researcher spinning out a biotech startup." },
    { name: "David Chen", email: "investor1@demo.io", role: "investor", organization: "Chen Capital", location: "San Francisco, CA", bio: "Angel investor focused on early-stage FinTech and HealthTech." },
    { name: "Sophia Laurent", email: "vc1@demo.io", role: "venture_capital", organization: "Meridian Ventures", location: "New York, NY", bio: "Partner at Meridian Ventures, Series A-focused." },
    { name: "James Okafor", email: "angel1@demo.io", role: "angel_investor", organization: "Independent", location: "London, UK", bio: "Exited founder, now writing checks for AI and CleanTech." },
    { name: "Grace Kim", email: "incubator1@demo.io", role: "incubator", organization: "Founders Forge", location: "Seattle, WA", bio: "Managing director of a 12-week seed-stage incubator." },
    { name: "Liam O'Brien", email: "accelerator1@demo.io", role: "accelerator", organization: "Velocity Labs", location: "Boston, MA", bio: "Runs a sector-agnostic accelerator program." },
    { name: "Fatima Al-Sayed", email: "gov1@demo.io", role: "government", organization: "National Innovation Agency", location: "Washington, DC", bio: "Manages public innovation grant programs." },
    { name: "Robert Douglas", email: "university1@demo.io", role: "university", organization: "Georgia Tech Innovation Office", location: "Atlanta, GA", bio: "Runs the university's student startup mentorship program." },
    { name: "Admin User", email: "admin@demo.io", role: "admin", organization: "FundingIQ", location: "Remote", bio: "Platform administrator." },
  ];

  const users = {};
  for (const u of usersData) {
    const created = await User.create({ ...u, password: MOCK_PASSWORD, isEmailVerified: true });
    users[u.email] = created;
    log(`${created.role.padEnd(16)} ${created.email}`);
  }

  // ---------------------------------------------------------------------
  // Startups
  // ---------------------------------------------------------------------
  console.log("\nCreating startups...");
  const startupsData = [
    {
      owner: users["founder1@demo.io"]._id,
      name: "Solara Health",
      tagline: "AI-powered diagnostics for underserved clinics",
      description: "Solara builds a low-cost diagnostic imaging device paired with an AI model trained to detect early-stage respiratory disease in areas without access to radiologists. We partner with rural clinics across three states and are expanding into telehealth triage.",
      industry: "HealthTech",
      technology: ["Computer Vision", "PyTorch", "Edge AI"],
      stage: "early_traction",
      location: "Austin, TX",
      foundedYear: 2023,
      teamSize: 6,
      fundingSought: 750000,
      fundingRaisedToDate: 150000,
      problemStatement: "Rural clinics lack access to specialist radiologists, delaying diagnosis of treatable respiratory conditions.",
      marketSize: "$4.2B addressable market in US rural/community health imaging.",
      status: "published",
      viewCount: 42,
    },
    {
      owner: users["founder2@demo.io"]._id,
      name: "GreenLoop",
      tagline: "Turning e-commerce returns into a circular supply chain",
      description: "GreenLoop operates a reverse-logistics network that inspects, refurbishes, and resells returned e-commerce goods on behalf of mid-size retailers, cutting landfill waste and recovering margin retailers currently write off.",
      industry: "CleanTech",
      technology: ["Logistics Optimization", "Computer Vision QC"],
      stage: "mvp",
      location: "Portland, OR",
      foundedYear: 2024,
      teamSize: 4,
      fundingSought: 400000,
      fundingRaisedToDate: 0,
      problemStatement: "Retailers discard 25% of e-commerce returns rather than pay to process them.",
      marketSize: "$761B in annual US retail returns volume.",
      status: "published",
      viewCount: 18,
    },
    {
      owner: users["founder3@demo.io"]._id,
      name: "PayBridge",
      tagline: "Instant cross-border settlement for emerging-market SMEs",
      description: "PayBridge lets small exporters in South and Southeast Asia get paid in local currency within minutes instead of the 5-7 day wait typical of correspondent banking, using a licensed stablecoin settlement rail under the hood.",
      industry: "FinTech",
      technology: ["Blockchain", "Node.js", "ISO 20022"],
      stage: "growth",
      location: "Bengaluru, IN",
      foundedYear: 2022,
      teamSize: 14,
      fundingSought: 2500000,
      fundingRaisedToDate: 900000,
      problemStatement: "SME exporters lose 2-4% of revenue to FX spreads and settlement delays.",
      marketSize: "$18B in annual cross-border SME payment volume across target corridors.",
      status: "published",
      viewCount: 96,
    },
    {
      owner: users["student1@demo.io"]._id,
      name: "AgriDrone Labs",
      tagline: "Autonomous crop-health drones for smallholder farms",
      description: "A senior thesis project turned startup: low-cost autonomous drones that fly pre-programmed routes over smallholder farms and flag pest and irrigation issues via multispectral imaging, priced for farms too small for existing enterprise offerings.",
      industry: "AgriTech",
      technology: ["Multispectral Imaging", "ROS", "Drone Hardware"],
      stage: "prototype",
      location: "Cambridge, MA",
      foundedYear: 2025,
      teamSize: 2,
      fundingSought: 150000,
      fundingRaisedToDate: 0,
      problemStatement: "Smallholder farmers can't afford enterprise-grade precision agriculture tools.",
      marketSize: "$2.1B addressable market among smallholder farms in target regions.",
      status: "published",
      viewCount: 7,
    },
    {
      owner: users["researcher1@demo.io"]._id,
      name: "Myco Materials",
      tagline: "Mycelium-based packaging to replace expanded polystyrene",
      description: "A biotech spinout from Stanford engineering mycelium composites that match EPS foam's protective packaging performance while being fully compostable, targeting electronics and appliance shippers first.",
      industry: "Biotech",
      technology: ["Synthetic Biology", "Materials Science"],
      stage: "idea",
      location: "Palo Alto, CA",
      foundedYear: 2025,
      teamSize: 3,
      fundingSought: 300000,
      fundingRaisedToDate: 0,
      problemStatement: "EPS foam packaging is cheap but non-biodegradable, and current compostable alternatives underperform on protection.",
      marketSize: "$9.8B global protective packaging market.",
      status: "draft",
      viewCount: 0,
    },
  ];

  const startups = [];
  for (const s of startupsData) {
    const created = await Startup.create(s);
    startups.push(created);
    log(`${created.name} (${created.status})`);
  }
  const [solara, greenloop, paybridge, agridrone, myco] = startups;

  // ---------------------------------------------------------------------
  // Proposals with mock AI evaluations (no Gemini call needed to test with)
  // ---------------------------------------------------------------------
  console.log("\nCreating proposals with mock AI evaluations...");

  const mockEvaluation = (overrides = {}) => ({
    innovationScore: 78, businessScore: 74, scalabilityScore: 71,
    financialReadiness: 62, technologyReadiness: 80, investmentReadiness: 68,
    marketPotential: 82, overallFundingReadiness: 74, successProbability: 66,
    swot: {
      strengths: ["Strong technical founding team", "Clear early customer validation", "Defensible technology moat"],
      weaknesses: ["Limited runway", "Thin sales pipeline outside pilot customers", "No dedicated finance lead"],
      opportunities: ["Large underserved market segment", "Potential channel partnerships", "Favorable regulatory tailwinds"],
      threats: ["Well-funded incumbents entering the space", "Long enterprise sales cycles", "Key-person dependency risk"],
    },
    riskAnalysis: [
      "Customer concentration risk with top 2 accounts representing significant revenue share",
      "Regulatory approval timeline could slip and delay go-to-market",
      "Founding team lacks prior experience scaling past seed stage",
    ],
    suggestions: [
      "Diversify pilot customers beyond the current two anchor accounts",
      "Bring on a finance/ops hire before the next raise",
      "Quantify unit economics with real cohort data, not projections",
      "Tighten the ask to match a clearly scoped 12-month milestone plan",
    ],
    grammarIssues: [],
    summary: "A technically credible early-stage venture with real customer validation, but financial planning and go-to-market depth need to mature before it's ready for institutional capital.",
    evaluatedAt: new Date(),
    modelUsed: "mock-seed-data",
    ...overrides,
  });

  const proposalsData = [
    {
      startup: solara._id,
      submittedBy: users["founder1@demo.io"]._id,
      title: "Solara Health — Seed Round Proposal",
      content: "Solara Health is building an AI-powered diagnostic imaging platform for rural clinics without radiologist access. Our device combines a low-cost imaging sensor with an on-device computer vision model trained on 40,000+ labeled chest scans, achieving 91% sensitivity for early-stage respiratory disease markers in field trials across 3 partner clinics. We are raising $750K to expand to 15 clinics, complete FDA pre-submission, and hire two clinical ML engineers.",
      status: "evaluated",
      aiEvaluation: mockEvaluation({ overallFundingReadiness: 79, marketPotential: 85 }),
    },
    {
      startup: paybridge._id,
      submittedBy: users["founder3@demo.io"]._id,
      title: "PayBridge — Series A Proposal",
      content: "PayBridge operates a licensed stablecoin settlement rail enabling instant cross-border payments for SME exporters in South and Southeast Asia. We've processed $42M in annualized volume across 380 active exporters, growing 22% month-over-month, with a take rate of 1.1%. We're raising $2.5M to expand licensing into two additional corridors and scale our compliance team ahead of anticipated regulatory changes.",
      status: "evaluated",
      aiEvaluation: mockEvaluation({ overallFundingReadiness: 84, businessScore: 88, financialReadiness: 80 }),
    },
    {
      startup: greenloop._id,
      submittedBy: users["founder2@demo.io"]._id,
      title: "GreenLoop — Pre-Seed Proposal",
      content: "GreenLoop's reverse-logistics platform helps mid-size e-commerce retailers recover value from returned goods instead of landfilling them. Our MVP is live with two pilot retailers, processing roughly 400 returned units per week with a 61% resale recovery rate. We're raising $400K to build out our sorting facility and land three additional retail partners.",
      status: "evaluated",
      aiEvaluation: mockEvaluation({ overallFundingReadiness: 61, financialReadiness: 48, investmentReadiness: 55 }),
    },
    {
      startup: agridrone._id,
      submittedBy: users["student1@demo.io"]._id,
      title: "AgriDrone Labs — Pre-Seed Proposal",
      content: "AgriDrone Labs builds low-cost autonomous drones for smallholder farm crop monitoring, priced at roughly 1/5th of enterprise precision-agriculture offerings. Our working prototype has completed 12 test flights across 3 partner farms. We're seeking $150K to fund a second hardware revision and a 6-month farmer pilot program.",
      status: "submitted", // deliberately left un-evaluated to demonstrate that flow too
    },
  ];

  const proposals = [];
  for (const p of proposalsData) {
    const created = await Proposal.create(p);
    proposals.push(created);
    log(`${created.title} (${created.status})`);
  }

  // ---------------------------------------------------------------------
  // Investor profiles
  // ---------------------------------------------------------------------
  console.log("\nCreating investor profiles...");
  await Investor.create({
    user: users["investor1@demo.io"]._id,
    firmName: "Chen Capital",
    type: "investor",
    industriesOfInterest: ["FinTech", "HealthTech"],
    preferredStages: ["idea", "prototype", "mvp", "early_traction"],
    preferredLocations: ["San Francisco, CA", "Austin, TX"],
    ticketSizeMin: 50000,
    ticketSizeMax: 500000,
    portfolio: ["Nimbus Pay", "Ferra Health"],
    bio: "Angel investor focused on early-stage FinTech and HealthTech founders.",
    verified: true,
  });
  await Investor.create({
    user: users["vc1@demo.io"]._id,
    firmName: "Meridian Ventures",
    type: "venture_capital",
    industriesOfInterest: ["FinTech", "SaaS", "AI/ML"],
    preferredStages: ["early_traction", "growth"],
    preferredLocations: ["New York, NY", "Bengaluru, IN"],
    ticketSizeMin: 1000000,
    ticketSizeMax: 5000000,
    portfolio: ["Ledgerly", "Northstar Freight"],
    bio: "Series A-focused fund investing across FinTech and vertical SaaS.",
    verified: true,
  });
  await Investor.create({
    user: users["angel1@demo.io"]._id,
    firmName: "Independent",
    type: "angel_investor",
    industriesOfInterest: ["CleanTech", "AI/ML", "AgriTech"],
    preferredStages: ["idea", "prototype"],
    preferredLocations: [],
    ticketSizeMin: 10000,
    ticketSizeMax: 100000,
    portfolio: [],
    bio: "Exited founder, now angel investing in AI and CleanTech.",
    verified: false,
  });
  log("3 investor profiles created");

  // ---------------------------------------------------------------------
  // Incubator profile
  // ---------------------------------------------------------------------
  await Incubator.create({
    user: users["incubator1@demo.io"]._id,
    name: "Founders Forge",
    type: "incubator",
    focusIndustries: ["HealthTech", "AgriTech", "Biotech"],
    location: "Seattle, WA",
    programDuration: "12 weeks",
    equityTaken: "6%",
    benefits: ["$125K pre-seed investment", "Dedicated EIR mentorship", "Demo Day with 200+ investors"],
    applicationOpen: true,
    website: "https://foundersforge.example.com",
  });
  const accelerator = await Incubator.create({
    user: users["accelerator1@demo.io"]._id,
    name: "Velocity Labs",
    type: "accelerator",
    focusIndustries: ["FinTech", "SaaS", "AI/ML"],
    location: "Boston, MA",
    programDuration: "16 weeks",
    equityTaken: "7%",
    benefits: ["$150K investment", "Access to 40+ VC partners", "Legal and ops support"],
    applicationOpen: true,
    website: "https://velocitylabs.example.com",
  });
  log("2 incubator/accelerator profiles created");

  // ---------------------------------------------------------------------
  // Funding opportunities, grants
  // ---------------------------------------------------------------------
  console.log("\nCreating funding opportunities and grants...");
  const opportunity1 = await FundingOpportunity.create({
    title: "Chen Capital — HealthTech Angel Check",
    type: "investor",
    postedBy: users["investor1@demo.io"]._id,
    description: "Writing $50K-$500K checks for early-stage FinTech and HealthTech founders with initial customer validation.",
    industry: ["HealthTech", "FinTech"],
    location: "San Francisco, CA",
    fundingStage: ["prototype", "mvp", "early_traction"],
    amountMin: 50000,
    amountMax: 500000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    eligibilityCriteria: ["Working prototype or MVP", "At least one paying or piloting customer"],
    isActive: true,
  });
  const opportunity2 = await FundingOpportunity.create({
    title: "Meridian Ventures — Series A FinTech Fund",
    type: "vc_firm",
    postedBy: users["vc1@demo.io"]._id,
    description: "Series A checks for FinTech and vertical SaaS companies with demonstrated early traction and a clear path to $1M+ ARR.",
    industry: ["FinTech", "SaaS"],
    location: "New York, NY",
    fundingStage: ["early_traction", "growth"],
    amountMin: 1000000,
    amountMax: 5000000,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    eligibilityCriteria: ["$500K+ ARR or equivalent transaction volume", "Existing institutional cap table"],
    isActive: true,
  });

  const grant1 = await Grant.create({
    name: "National Innovation Grant — CleanTech Track",
    issuingBody: "National Innovation Agency",
    postedBy: users["gov1@demo.io"]._id,
    description: "Non-dilutive funding for early-stage CleanTech ventures addressing supply chain sustainability.",
    amount: 100000,
    industryFocus: ["CleanTech", "AgriTech"],
    eligibility: ["US-based entity", "Pre-Series A", "Founded within the last 3 years"],
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    documentsRequired: ["Pitch deck", "Founder bios", "Use-of-funds breakdown"],
    status: "open",
  });
  const grant2 = await Grant.create({
    name: "SBIR Phase I — HealthTech Diagnostics",
    issuingBody: "National Innovation Agency",
    postedBy: users["gov1@demo.io"]._id,
    description: "Federal research grant supporting early-stage diagnostic technology development.",
    amount: 275000,
    industryFocus: ["HealthTech", "Biotech"],
    eligibility: ["US-based small business", "No prior SBIR Phase I award for this technology"],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    documentsRequired: ["Technical narrative", "Budget justification", "Letters of support"],
    status: "open",
  });
  log("2 funding opportunities, 2 grants created");

  // ---------------------------------------------------------------------
  // Applications (tie startups to opportunities/grants/incubators)
  // ---------------------------------------------------------------------
  console.log("\nCreating applications...");
  const app1 = await Application.create({
    startup: solara._id,
    applicant: users["founder1@demo.io"]._id,
    opportunityType: "grant",
    opportunity: grant2._id,
    opportunityModelName: "Grant",
    proposal: proposals[0]._id,
    status: "under_review",
    reviewerNotes: "Strong technical fit — reviewing budget justification now.",
    statusHistory: [
      { status: "applied", changedBy: users["founder1@demo.io"]._id },
      { status: "under_review", changedBy: users["gov1@demo.io"]._id },
    ],
  });
  const app2 = await Application.create({
    startup: paybridge._id,
    applicant: users["founder3@demo.io"]._id,
    opportunityType: "funding_opportunity",
    opportunity: opportunity2._id,
    opportunityModelName: "FundingOpportunity",
    proposal: proposals[1]._id,
    status: "accepted",
    reviewerNotes: "Great traction, moving to term sheet discussion.",
    statusHistory: [
      { status: "applied", changedBy: users["founder3@demo.io"]._id },
      { status: "under_review", changedBy: users["vc1@demo.io"]._id },
      { status: "accepted", changedBy: users["vc1@demo.io"]._id },
    ],
  });
  const app3 = await Application.create({
    startup: greenloop._id,
    applicant: users["founder2@demo.io"]._id,
    opportunityType: "grant",
    opportunity: grant1._id,
    opportunityModelName: "Grant",
    proposal: proposals[2]._id,
    status: "applied",
    statusHistory: [{ status: "applied", changedBy: users["founder2@demo.io"]._id }],
  });
  const app4 = await Application.create({
    startup: agridrone._id,
    applicant: users["student1@demo.io"]._id,
    opportunityType: "incubator",
    opportunity: accelerator._id,
    opportunityModelName: "Incubator",
    status: "rejected",
    reviewerNotes: "Promising tech but too early for our cohort — encouraged to reapply next cycle.",
    statusHistory: [
      { status: "applied", changedBy: users["student1@demo.io"]._id },
      { status: "rejected", changedBy: users["accelerator1@demo.io"]._id },
    ],
  });
  log("4 applications created across all statuses");

  // ---------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------
  console.log("\nCreating investor reviews...");
  await Review.create({
    startup: paybridge._id,
    reviewer: users["vc1@demo.io"]._id,
    rating: 5,
    feedback: "Impressive traction and a defensible regulatory moat. Ready to move fast on a term sheet.",
    decision: "accepted",
  });
  await Review.create({
    startup: solara._id,
    reviewer: users["investor1@demo.io"]._id,
    rating: 4,
    feedback: "Strong clinical validation so far — would like to see a finance hire before committing.",
    decision: "meeting_requested",
  });
  log("2 reviews created");

  // ---------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------
  console.log("\nCreating notifications...");
  const notifData = [
    { user: users["founder1@demo.io"]._id, type: "ai_evaluation", title: "AI evaluation complete", message: `Your proposal "${proposals[0].title}" scored 79/100 for funding readiness.`, link: `/dashboard/proposals/${proposals[0]._id}` },
    { user: users["founder1@demo.io"]._id, type: "application_status", title: "Application status updated", message: "Your application is now \"under review\".", link: `/dashboard/applications/${app1._id}`, isRead: true },
    { user: users["founder3@demo.io"]._id, type: "review", title: "New investor feedback", message: "An investor accepted your startup \"PayBridge\".", link: `/dashboard/startups/${paybridge._id}` },
    { user: users["founder2@demo.io"]._id, type: "application_status", title: "Application status updated", message: "Your application is now \"applied\".", link: `/dashboard/applications/${app3._id}`, isRead: true },
    { user: users["student1@demo.io"]._id, type: "application_status", title: "Application status updated", message: "Your application is now \"rejected\".", link: `/dashboard/applications/${app4._id}` },
  ];
  await Notification.insertMany(notifData);
  log(`${notifData.length} notifications created`);

  // ---------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------
  console.log("\nCreating message threads...");
  const thread1 = [
    { sender: users["investor1@demo.io"]._id, recipient: users["founder1@demo.io"]._id, content: "Hi Aisha — loved the pitch deck. Do you have clinical trial data beyond the 3 pilot clinics?" },
    { sender: users["founder1@demo.io"]._id, recipient: users["investor1@demo.io"]._id, content: "Thanks David! We have IRB-approved data from all 3 sites, happy to share under NDA." },
    { sender: users["investor1@demo.io"]._id, recipient: users["founder1@demo.io"]._id, content: "Great, let's set up a call this week to go through it." },
  ];
  for (const m of thread1) {
    await Message.create({ ...m, conversationId: conversationId(m.sender, m.recipient) });
  }

  const thread2 = [
    { sender: users["vc1@demo.io"]._id, recipient: users["founder3@demo.io"]._id, content: "Priya, term sheet is with legal now — should have it to you by Friday." },
    { sender: users["founder3@demo.io"]._id, recipient: users["vc1@demo.io"]._id, content: "Excellent, thank you Sophia! We're ready to move quickly on our end." },
  ];
  for (const m of thread2) {
    await Message.create({ ...m, conversationId: conversationId(m.sender, m.recipient) });
  }
  log("2 message threads created");

  // ---------------------------------------------------------------------
  // Bookmarks
  // ---------------------------------------------------------------------
  console.log("\nCreating bookmarks...");
  await Bookmark.create({ user: users["founder2@demo.io"]._id, itemType: "Grant", item: grant1._id });
  await Bookmark.create({ user: users["founder1@demo.io"]._id, itemType: "Grant", item: grant2._id });
  await Bookmark.create({ user: users["student1@demo.io"]._id, itemType: "Incubator", item: accelerator._id });
  log("3 bookmarks created");

  // ---------------------------------------------------------------------
  // Analytics snapshots (a few days of platform-level metrics)
  // ---------------------------------------------------------------------
  console.log("\nCreating analytics records...");
  const analyticsRecords = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    analyticsRecords.push({ scope: "platform", metric: "daily_signups", value: Math.floor(Math.random() * 5) + 1, date });
    analyticsRecords.push({ scope: "platform", metric: "daily_active_users", value: Math.floor(Math.random() * 20) + 10, date });
  }
  await Analytics.insertMany(analyticsRecords);
  log(`${analyticsRecords.length} analytics records created`);

  // ---------------------------------------------------------------------
  // Admin audit log
  // ---------------------------------------------------------------------
  await AdminLog.create({
    admin: users["admin@demo.io"]._id,
    action: "grant_approved",
    targetType: "Grant",
    targetId: grant1._id,
    details: "Approved CleanTech grant track for public listing.",
  });
  log("1 admin log entry created");

  console.log("\n✅ Seed complete.\n");
  console.log("Log in as any of these (password for all: " + MOCK_PASSWORD + "):");
  usersData.forEach((u) => console.log(`  ${u.email.padEnd(24)} ${u.role}`));

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

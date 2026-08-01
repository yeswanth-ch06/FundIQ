import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiTrendingUp, FiUsers, FiShield, FiCpu, FiTarget, FiCheckCircle,
  FiChevronDown, FiArrowRight,
} from "react-icons/fi";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const STATS = [
  { value: "12", label: "Roles supported" },
  { value: "8", label: "AI readiness metrics" },
  { value: "24/7", label: "Proposal evaluation" },
  { value: "1", label: "Platform, every stakeholder" },
];

const FEATURES = [
  {
    icon: FiCpu,
    title: "AI proposal evaluation",
    desc: "Every submission is scored across innovation, scalability, financial readiness, and market potential — with a full SWOT and risk breakdown.",
  },
  {
    icon: FiTarget,
    title: "Funding recommendation engine",
    desc: "Matched automatically against investors, VCs, government schemes, incubators, and accelerators based on industry, stage, and geography.",
  },
  {
    icon: FiTrendingUp,
    title: "Application tracking",
    desc: "Follow every application from submitted to accepted in one dashboard, with deadline reminders so nothing slips through.",
  },
  {
    icon: FiUsers,
    title: "Built for every stakeholder",
    desc: "Founders, researchers, investors, incubators, universities, and government bodies each get a portal shaped around what they need to do.",
  },
  {
    icon: FiShield,
    title: "Secure by default",
    desc: "JWT auth, encrypted passwords, and role-based access control keep sensitive pitch decks and financials where they belong.",
  },
  {
    icon: FiCheckCircle,
    title: "Real-time collaboration",
    desc: "Message investors directly, get reviewer feedback, and see status changes the moment they happen.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create your profile", desc: "Set up your startup or investor profile with the details that matter for matching." },
  { step: "02", title: "Submit for AI evaluation", desc: "Upload a pitch deck or write your proposal — get a funding readiness score in minutes." },
  { step: "03", title: "Get matched", desc: "The recommendation engine surfaces investors, grants, and programs that fit your stage and industry." },
  { step: "04", title: "Track every application", desc: "Apply, follow status changes, and message reviewers — all from one dashboard." },
];

const PRICING = [
  {
    name: "Starter", price: "Free", period: "forever",
    features: ["1 startup profile", "3 AI evaluations / month", "Basic funding matches", "Community support"],
  },
  {
    name: "Growth", price: "$49", period: "/month", highlighted: true,
    features: ["5 startup profiles", "Unlimited AI evaluations", "Priority funding matches", "Investor messaging", "Application tracking"],
  },
  {
    name: "Enterprise", price: "Custom", period: "",
    features: ["Unlimited profiles", "Dedicated account manager", "API access", "Custom integrations", "SLA support"],
  },
];

const FAQS = [
  { q: "How does the AI evaluate my proposal?", a: "It analyzes your pitch deck or written proposal against innovation, business viability, scalability, and market potential, then generates a SWOT analysis and concrete suggestions for improvement." },
  { q: "Is my data shared with investors automatically?", a: "No. You control what's published. Your profile stays private until you choose to publish it or apply to a specific opportunity." },
  { q: "Can government agencies and universities use this too?", a: "Yes — dedicated portals let government bodies publish schemes and manage applications, and universities can track student startups and offer mentorship." },
  { q: "What happens after I apply to a funding opportunity?", a: "Your application moves through a tracked pipeline — applied, under review, accepted, rejected, or withdrawn — and you're notified at every status change." },
];

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-30 border-b border-gray-100 dark:border-gray-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">FundingIQ</span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-gray-900 dark:hover:text-white transition">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
              Sign in
            </Link>
            <Link to="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-950/30 dark:via-gray-950 dark:to-gray-950" />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-block rounded-full bg-brand-100 dark:bg-brand-900/40 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
              AI-powered funding intelligence
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Get your startup funding-ready — before you pitch.
            </h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-lg">
              AI evaluates your proposal across the metrics investors actually care about,
              then matches you with the right investors, grants, and programs.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/register" className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 transition">
                Start free <FiArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                See how it works
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto"
          >
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-8 w-80">
              <p className="text-sm text-gray-500">Funding Readiness Score</p>
              <div className="mt-4 flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-40 h-40">
                  <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="14" />
                  <circle
                    cx="80" cy="80" r="68" fill="none" stroke="#4f46e5" strokeWidth="14"
                    strokeDasharray={2 * Math.PI * 68} strokeDashoffset={2 * Math.PI * 68 * (1 - 0.82)}
                    strokeLinecap="round" transform="rotate(-90 80 80)"
                  />
                  <text x="80" y="76" textAnchor="middle" className="fill-gray-900 dark:fill-white text-3xl font-bold" fontSize="32">82</text>
                  <text x="80" y="98" textAnchor="middle" className="fill-gray-400 text-xs" fontSize="11">out of 100</text>
                </svg>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                {[["Innovation", 88], ["Scalability", 79], ["Market Potential", 84]].map(([label, val]) => (
                  <div key={label}>
                    <div className="flex justify-between text-gray-500 mb-1">
                      <span>{label}</span><span>{val}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: val + "%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-gray-100 dark:border-gray-900">
        <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold tracking-tight text-brand-600 dark:text-brand-400">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight">Everything the funding process needs, in one place</h2>
          <p className="mt-3 text-gray-500">From first draft to signed check — built for founders and the people who fund them.</p>
        </motion.div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition"
            >
              <div className="inline-flex rounded-lg bg-brand-50 dark:bg-brand-900/30 p-2.5 text-brand-600 dark:text-brand-400">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-gray-50 dark:bg-gray-900/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold tracking-tight text-center">
            How it works
          </motion.h2>
          <div className="mt-14 grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.08 }}
              >
                <span className="text-sm font-bold text-brand-500">{step.step}</span>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold tracking-tight text-center">
          Simple, transparent pricing
        </motion.h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className={"rounded-2xl border p-8 " + (tier.highlighted ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 shadow-lg scale-[1.02]" : "border-gray-200 dark:border-gray-800")}
            >
              <h3 className="font-semibold">{tier.name}</h3>
              <p className="mt-3 text-3xl font-bold">
                {tier.price} <span className="text-sm font-normal text-gray-500">{tier.period}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiCheckCircle size={14} className="text-brand-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={"mt-8 block text-center rounded-lg py-2.5 text-sm font-medium transition " + (tier.highlighted ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800")}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-gray-50 dark:bg-gray-900/40 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-bold tracking-tight text-center">Frequently asked questions</h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
                >
                  {f.q}
                  <FiChevronDown className={"transition-transform " + (openFaq === i ? "rotate-180" : "")} />
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-sm text-gray-500">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Ready to become funding-ready?</h2>
        <p className="mt-3 text-gray-500">Join founders, investors, and institutions already using FundingIQ.</p>
        <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition">
          Create your free account <FiArrowRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-900">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} FundingIQ. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 dark:hover:text-white transition">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

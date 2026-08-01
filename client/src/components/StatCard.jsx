// Tailwind can't see dynamically-built class names like `bg-${accent}-50`
// at build time, so the accent options are spelled out here explicitly.
const ACCENT_CLASSES = {
  brand: "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400",
  emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
};

const StatCard = ({ label, value, icon: Icon, accent = "brand" }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      {Icon && (
        <div className={`rounded-lg p-2 ${ACCENT_CLASSES[accent] || ACCENT_CLASSES.brand}`}>
          <Icon size={16} />
        </div>
      )}
    </div>
    <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
  </div>
);

export default StatCard;

const SCORE_FIELDS = [
  ["innovationScore", "Innovation"],
  ["businessScore", "Business Viability"],
  ["scalabilityScore", "Scalability"],
  ["financialReadiness", "Financial Readiness"],
  ["technologyReadiness", "Technology Readiness"],
  ["investmentReadiness", "Investment Readiness"],
  ["marketPotential", "Market Potential"],
  ["successProbability", "Success Probability"],
];

const barColor = (val) => {
  if (val >= 70) return "bg-emerald-500";
  if (val >= 40) return "bg-amber-500";
  return "bg-red-500";
};

const EvaluationScorecard = ({ evaluation }) => {
  if (!evaluation) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50" fill="none" stroke="#4f46e5" strokeWidth="10"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 * (1 - (evaluation.overallFundingReadiness || 0) / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{evaluation.overallFundingReadiness ?? "—"}</span>
            <span className="text-[10px] text-gray-400">readiness</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Overall funding readiness</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md">{evaluation.summary}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
        {SCORE_FIELDS.map(([key, label]) => (
          <div key={key}>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{label}</span>
              <span>{evaluation[key] ?? "—"}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className={`h-1.5 rounded-full ${barColor(evaluation[key] || 0)}`} style={{ width: `${evaluation[key] || 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      {evaluation.swot && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ["Strengths", evaluation.swot.strengths, "emerald"],
            ["Weaknesses", evaluation.swot.weaknesses, "red"],
            ["Opportunities", evaluation.swot.opportunities, "brand"],
            ["Threats", evaluation.swot.threats, "amber"],
          ].map(([label, items]) => (
            <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-sm font-semibold mb-2">{label}</p>
              <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                {(items || []).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {evaluation.suggestions?.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Suggestions for improvement</p>
          <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
            {evaluation.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {evaluation.riskAnalysis?.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Risk analysis</p>
          <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
            {evaluation.riskAnalysis.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {evaluation.grammarIssues?.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Grammar & clarity notes</p>
          <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
            {evaluation.grammarIssues.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EvaluationScorecard;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiZap } from "react-icons/fi";
import * as proposalService from "../../services/proposalService.js";
import EvaluationScorecard from "../../components/EvaluationScorecard.jsx";

const ProposalDetail = () => {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const load = () => {
    proposalService.getProposalById(id)
      .then(({ data }) => setProposal(data.proposal))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const { data } = await proposalService.runEvaluation(id);
      setProposal(data.proposal);
      toast.success("Evaluation complete");
    } catch (err) {
      toast.error(err.response?.data?.message || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return <div className="p-8"><div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" /></div>;
  }
  if (!proposal) return <div className="p-8 text-sm text-gray-500">Proposal not found.</div>;

  const hasEvaluation = Boolean(proposal.aiEvaluation?.evaluatedAt);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{proposal.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{proposal.startup?.name}</p>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={evaluating}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-60"
        >
          <FiZap size={16} /> {evaluating ? "Evaluating..." : hasEvaluation ? "Re-run evaluation" : "Run AI evaluation"}
        </button>
      </div>

      <div className="mt-8">
        {hasEvaluation ? (
          <EvaluationScorecard evaluation={proposal.aiEvaluation} />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
            <p className="text-gray-500">This proposal hasn't been evaluated yet.</p>
            <p className="text-sm text-gray-400 mt-1">Click "Run AI evaluation" to get your funding readiness score.</p>
          </div>
        )}
      </div>

      <details className="mt-8">
        <summary className="text-sm font-medium cursor-pointer text-gray-500">View submitted content</summary>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          {proposal.content}
        </p>
      </details>
    </div>
  );
};

export default ProposalDetail;

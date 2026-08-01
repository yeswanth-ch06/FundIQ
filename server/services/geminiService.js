import { GoogleGenAI } from "@google/genai";
import AppError from "../utils/AppError.js";

let ai;
const getClient = () => {
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
};

const EVALUATION_SCHEMA_DESCRIPTION = `
Return ONLY a JSON object with exactly this shape (no markdown, no prose outside the JSON):
{
  "innovationScore": number (0-100),
  "businessScore": number (0-100),
  "scalabilityScore": number (0-100),
  "financialReadiness": number (0-100),
  "technologyReadiness": number (0-100),
  "investmentReadiness": number (0-100),
  "marketPotential": number (0-100),
  "overallFundingReadiness": number (0-100),
  "successProbability": number (0-100),
  "swot": {
    "strengths": string[] (3-5 items),
    "weaknesses": string[] (3-5 items),
    "opportunities": string[] (3-5 items),
    "threats": string[] (3-5 items)
  },
  "riskAnalysis": string[] (3-5 concrete risks),
  "suggestions": string[] (3-6 concrete, actionable improvements),
  "grammarIssues": string[] (specific grammar/clarity issues found in the text, empty array if none),
  "summary": string (2-3 sentence executive summary of the proposal)
}
`.trim();

/**
 * Sends a startup proposal to Gemini for structured funding-readiness
 * evaluation. Throws AppError(502) if the model call fails or returns
 * something that doesn't parse as the expected JSON shape.
 * @param {{ title: string, content: string, industry?: string, stage?: string }} proposal
 */
export const evaluateProposal = async ({ title, content, industry, stage }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError("AI evaluation is not configured on this server (missing GEMINI_API_KEY)", 503);
  }

  const systemPrompt = `You are a senior venture capital analyst evaluating startup funding proposals.
Be honest and critical — do not inflate scores. A weak proposal should score low.
${EVALUATION_SCHEMA_DESCRIPTION}`;

  const userPrompt = `Evaluate this startup proposal.

Title: ${title}
${industry ? `Industry: ${industry}` : ""}
${stage ? `Stage: ${stage}` : ""}

Proposal content:
"""
${content.slice(0, 12000)}
"""`;

  let response;
  try {
    response = await getClient().models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });
  } catch (err) {
    throw new AppError(`AI evaluation request failed: ${err.message}`, 502);
  }

  let parsed;
  try {
    parsed = JSON.parse(response.text);
  } catch (err) {
    throw new AppError("AI evaluation returned an unparseable response", 502);
  }

  return {
    innovationScore: clampScore(parsed.innovationScore),
    businessScore: clampScore(parsed.businessScore),
    scalabilityScore: clampScore(parsed.scalabilityScore),
    financialReadiness: clampScore(parsed.financialReadiness),
    technologyReadiness: clampScore(parsed.technologyReadiness),
    investmentReadiness: clampScore(parsed.investmentReadiness),
    marketPotential: clampScore(parsed.marketPotential),
    overallFundingReadiness: clampScore(parsed.overallFundingReadiness),
    successProbability: clampScore(parsed.successProbability),
    swot: {
      strengths: parsed.swot?.strengths || [],
      weaknesses: parsed.swot?.weaknesses || [],
      opportunities: parsed.swot?.opportunities || [],
      threats: parsed.swot?.threats || [],
    },
    riskAnalysis: parsed.riskAnalysis || [],
    suggestions: parsed.suggestions || [],
    grammarIssues: parsed.grammarIssues || [],
    summary: parsed.summary || "",
    evaluatedAt: new Date(),
    modelUsed: "gemini-3.5-flash",
  };
};

const clampScore = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

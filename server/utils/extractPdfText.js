import pdfParse from "pdf-parse";
import AppError from "./AppError.js";

/**
 * Extracts plain text from an uploaded PDF buffer (e.g. a pitch deck or
 * proposal document) so it can be fed into the AI evaluation prompt.
 */
export const extractPdfText = async (buffer) => {
  try {
    const result = await pdfParse(buffer);
    return result.text.trim();
  } catch (err) {
    throw new AppError("Could not extract text from the uploaded PDF", 400);
  }
};

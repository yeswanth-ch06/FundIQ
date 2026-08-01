import { validationResult } from "express-validator";

// Runs after an array of express-validator checks; short-circuits with a
// 422 listing every field error if any check failed.
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export default validateRequest;

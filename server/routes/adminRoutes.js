import express from "express";
import {
  getUsers,
  setUserStatus,
  setUserRole,
  getAllStartups,
  deleteStartupAsAdmin,
  getAllGrants,
  getAllApplications,
  getReports,
  getLogs,
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import authorize from "../middleware/roleCheck.js";

const router = express.Router();

// Every route here is admin-only.
router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.patch("/users/:id/status", setUserStatus);
router.patch("/users/:id/role", setUserRole);

router.get("/startups", getAllStartups);
router.delete("/startups/:id", deleteStartupAsAdmin);

router.get("/grants", getAllGrants);
router.get("/applications", getAllApplications);

router.get("/reports", getReports);
router.get("/logs", getLogs);

export default router;

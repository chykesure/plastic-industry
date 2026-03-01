import express from "express";
import { getApprovals, approveOrder, rejectOrder } from "../controllers/approvalController.js";

const router = express.Router();

router.get("/", getApprovals);
router.put("/approve/:id", approveOrder);
router.put("/reject/:id", rejectOrder);

export default router;

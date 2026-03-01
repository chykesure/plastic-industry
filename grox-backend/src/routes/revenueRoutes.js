import express from "express";
import { getRevenueReport } from "../controllers/revenueController.js";

const router = express.Router();

router.get("/", getRevenueReport);

export default router;

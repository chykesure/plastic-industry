import express from "express";
import {
    createUser,
    getUsers,
    updateUser,
    resetPassword,
    deleteUser, // <-- import this
    loginUser,
} from "../controllers/accountsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);

// PLACE THIS FIRST
router.put("/reset-password/:id", resetPassword);

// THEN PUT THIS
router.put("/:id", updateUser);

router.delete("/:id", deleteUser);
router.post("/login", loginUser);


export default router;

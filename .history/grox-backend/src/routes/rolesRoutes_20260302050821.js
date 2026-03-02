const express = require("express");
const router = express.Router();
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} = require("../controllers/rolesController");
const { protect } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect);

router.get("/", getRoles);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

module.exports = router;

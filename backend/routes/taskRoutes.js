const express = require("express");
const {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
} = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createTask);
router.get("/project/:projectId", getProjectTasks);
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/move", moveTask);

module.exports = router;

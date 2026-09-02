const express = require("express");
const {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} = require("../controllers/memberController");
const protect = require("../middleware/authMiddleware");
const {
  getProjectFromParams,
  requireProjectOwner,
} = require("../middleware/projectMiddleware");

const router = express.Router();

router.use(protect);

router.get("/:projectId", getProjectFromParams, getProjectMembers);

router.post(
  "/:projectId",
  getProjectFromParams,
  requireProjectOwner,
  addProjectMember,
);

router.patch(
  "/:projectId/:userId",
  getProjectFromParams,
  requireProjectOwner,
  updateMemberRole,
);

router.delete(
  "/:projectId/:userId",
  getProjectFromParams,
  requireProjectOwner,
  removeProjectMember,
);

module.exports = router;

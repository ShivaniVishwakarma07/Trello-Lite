const Project = require("../models/Project");

const getProjectFromParams = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    req.project = project;

    next();
  } catch (error) {
    res.status(500).json({
      message: "Failed to load project",
      error: error.message,
    });
  }
};

const requireProjectOwner = (req, res, next) => {
  if (req.project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Only the project owner can perform this action",
    });
  }

  next();
};

const requireProjectManager = (req, res, next) => {
  const isOwner = req.project.owner.toString() === req.user._id.toString();

  const member = req.project.members.find(
    (member) => member.user.toString() === req.user._id.toString(),
  );

  const isManager = member?.role === "manager";

  if (!isOwner && !isManager) {
    return res.status(403).json({
      message: "Manager permission required",
    });
  }

  next();
};

module.exports = {
  getProjectFromParams,
  requireProjectOwner,
  requireProjectManager,
};

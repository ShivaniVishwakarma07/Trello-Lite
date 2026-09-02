const User = require("../models/User");

const getProjectMembers = async (req, res) => {
  try {
    const project = await req.project.populate(
      "members.user",
      "name email role",
    );

    res.json({
      owner: project.owner,
      members: project.members,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project members",
      error: error.message,
    });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { userId, role = "member" } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!["member", "manager"].includes(role)) {
      return res.status(400).json({
        message: "Invalid project role",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.project.owner.toString() === userId.toString()) {
      return res.status(400).json({
        message: "Project owner is already part of the project",
      });
    }

    const alreadyMember = req.project.members.some(
      (member) => member.user.toString() === userId.toString(),
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "User is already a project member",
      });
    }

    req.project.members.push({
      user: userId,
      role,
    });

    await req.project.save();

    const updatedProject = await req.project.populate(
      "members.user",
      "name email",
    );

    res.status(201).json({
      message: "Member added successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add project member",
      error: error.message,
    });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["member", "manager"].includes(role)) {
      return res.status(400).json({
        message: "Invalid project role",
      });
    }

    const member = req.project.members.find(
      (member) => member.user.toString() === userId.toString(),
    );

    if (!member) {
      return res.status(404).json({
        message: "Project member not found",
      });
    }

    member.role = role;

    await req.project.save();

    const updatedProject = await req.project.populate(
      "members.user",
      "name email",
    );

    res.json({
      message: "Member role updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update member role",
      error: error.message,
    });
  }
};

const removeProjectMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const memberExists = req.project.members.some(
      (member) => member.user.toString() === userId.toString(),
    );

    if (!memberExists) {
      return res.status(404).json({
        message: "Project member not found",
      });
    }

    req.project.members = req.project.members.filter(
      (member) => member.user.toString() !== userId.toString(),
    );

    await req.project.save();

    res.json({
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove project member",
      error: error.message,
    });
  }
};

module.exports = {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
};

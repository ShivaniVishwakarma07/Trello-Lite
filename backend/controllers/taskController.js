const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const hasProjectAccess = (project, userId) => {
  const isOwner = project.owner.toString() === userId.toString();

  const isMember = project.members.some(
    (member) => member.user.toString() === userId.toString(),
  );

  return isOwner || isMember;
};

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, status } =
      req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Title and project are required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    if (assignedTo) {
      const isProjectMember = project.members.some(
        (member) => member.user.toString() === assignedTo.toString(),
      );

      if (
        project.owner.toString() !== assignedTo.toString() &&
        !isProjectMember
      ) {
        return res.status(400).json({
          message: "Assigned user is not a project member",
        });
      }

      const userExists = await User.findById(assignedTo);

      if (!userExists) {
        return res.status(404).json({
          message: "Assigned user not found",
        });
      }
    }

    const lastTask = await Task.findOne({ project: projectId })
      .sort({ position: -1 })
      .select("position");

    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || "medium",
      status: status || "todo",
      position,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ status: 1, position: 1 });

    res.json({
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name owner members");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (!hasProjectAccess(task.project, req.user._id)) {
      return res.status(403).json({
        message: "You do not have access to this task",
      });
    }

    res.json({
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch task",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "You do not have access to this task",
      });
    }

    if (assignedTo) {
      const isProjectMember = project.members.some(
        (member) => member.user.toString() === assignedTo.toString(),
      );

      if (
        project.owner.toString() !== assignedTo.toString() &&
        !isProjectMember
      ) {
        return res.status(400).json({
          message: "Assigned user is not a project member",
        });
      }
    }

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo || null;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (status !== undefined) {
      task.status = status;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project owner can delete tasks",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

const moveTask = async (req, res) => {
  try {
    const { status, position } = req.body;

    if (status === undefined || position === undefined) {
      return res.status(400).json({
        message: "Status and position are required",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({
        message: "You do not have access to this task",
      });
    }

    task.status = status;
    task.position = position;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    res.json({
      message: "Task moved successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to move task",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
};

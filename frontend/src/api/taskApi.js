import api from "./axios";

export const getTasks = async (projectId) => {
  const response = await api.get(`/tasks/project/${projectId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

export const moveTask = async (taskId, taskData) => {
  const response = await api.patch(`/tasks/${taskId}/move`, taskData);
  return response.data;
};

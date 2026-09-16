import api from "./axios";

export const getProjectMembers = async (projectId) => {
  const response = await api.get(`/projects/members/${projectId}`);
  return response.data;
};

export const addProjectMember = async (projectId, memberData) => {
  const response = await api.post(`/projects/members/${projectId}`, memberData);
  return response.data;
};

export const updateMemberRole = async (projectId, userId, role) => {
  const response = await api.patch(`/projects/members/${projectId}/${userId}`, {
    role,
  });
  return response.data;
};

export const removeProjectMember = async (projectId, userId) => {
  const response = await api.delete(`/projects/members/${projectId}/${userId}`);
  return response.data;
};

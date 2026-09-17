let io;

const initializeSocket = (socketServer) => {
  io = socketServer;
};

const sendNotification = (userId, notification) => {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit("notification", {
    ...notification,
    createdAt: new Date(),
  });
};

module.exports = {
  initializeSocket,
  sendNotification,
};

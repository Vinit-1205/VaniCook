// CookConnect Phase 2 Real-time Socket.IO Engine
// Supports live neighbourhood pool updates, member changes, dynamic pricing recalculations, and cook alerts

let ioInstance = null;

export const setupSockets = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Authenticated user room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Residential society room
    socket.on('join_society_room', (societyId) => {
      if (societyId) {
        socket.join(`society:${societyId}`);
      }
    });

    // Specific neighbourhood pool group room
    socket.on('join_group_room', (groupId) => {
      if (groupId) {
        socket.join(`group:${groupId}`);
      }
    });

    socket.on('leave_group_room', (groupId) => {
      if (groupId) {
        socket.leave(`group:${groupId}`);
      }
    });
  });

  return io;
};

export const emitToSociety = (societyId, event, data) => {
  if (ioInstance && societyId) {
    ioInstance.to(`society:${societyId}`).emit(event, data);
  }
};

export const emitToGroup = (groupId, event, data) => {
  if (ioInstance && groupId) {
    ioInstance.to(`group:${groupId}`).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
};

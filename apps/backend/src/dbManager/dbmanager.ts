import prisma from "@repo/db/client";

export class DatabaseManager {
  private static instance: DatabaseManager;

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async createMessage(content: string, userId: string, roomId: string) {
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        roomId,
      },
    });

    const { createdAt, updatedAt, ...rest } = message;
    return rest;
  }

  async addRoomIdInUsersDB(roomId: string, userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return false;
      }

      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

      if (!room) {
        return false;
      }

      const existingRoomUser = await prisma.roomUser.findFirst({
        where: {
          userId: userId,
          roomId: roomId,
        },
      });

      if (existingRoomUser) {
        return existingRoomUser ? true : false;
      }

      const roomUser = await prisma.roomUser.create({
        data: {
          userId: userId,
          roomId: roomId,
        },
      });
      return roomUser ? true : false;
    } catch (error) {
      console.log(error);
    }
  }

  async validateUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      return user ? true : false;
    } catch (error) {}
  }
}

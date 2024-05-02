import { generateSlug } from "random-word-slugs";
import httpStatus from "http-status";

import prisma from "@repo/db/client";

import ServiceError from "../utils/customError";

class RoomRepo {
  async generateRoom(userId: string) {
    try {
      console.log("inside repo");

      const findUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      console.log("i'm here 0");

      if (!findUser) {
        throw new ServiceError(
          "NOT_FOUND",
          "User not present in database",
          httpStatus.UNAUTHORIZED
        );
      }
      console.log("1");
      const slug = generateSlug();
      const room = await prisma.room.create({
        data: {
          name: slug,
          creatorId: userId,
        },
      });
      console.log("2");
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          Room: {
            connect: {
              id: room.id,
            },
          },
        },
      });
      console.log("3");
      await prisma.roomUser.create({
        data: {
          roomId: room.id,
          userId,
        },
      });
      return room;
    } catch (error) {
      console.log(error);
    }
  }
}

export default RoomRepo;

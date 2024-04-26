import { generateSlug } from "random-word-slugs";
import httpStatus from "http-status";

import prisma from "@repo/db/client";

import ServiceError from "../utils/customError";

class RoomRepo {
  async generateURL(userId: string) {
    try {
      const slug = generateSlug();
      const findUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!findUser) {
        throw new ServiceError(
          "NOT_FOUND",
          "User not present in database",
          httpStatus.UNAUTHORIZED
        );
      }
      const room = await prisma.room.create({
        data: {
          name: slug,
          author: findUser?.id,
        },
      });

      return room;
    } catch (error) {
      throw error;
    }
  }
}

export default RoomRepo;

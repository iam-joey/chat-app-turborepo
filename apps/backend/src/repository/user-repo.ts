import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { UserValidationSchemaType } from "@repo/common/userValidation";
import prisma from "@repo/db/client";

import ServiceError from "../utils/customError";

class UserRepo {
  async createUser(userData: UserValidationSchemaType) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: userData.email,
        },
      });

      if (user) {
        throw new ServiceError(
          "USER EXITS",
          "User with this email already exits",
          httpStatus.CONFLICT
        );
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
        },
      });

      return newUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getUser(email: string) {
    try {
      console.log("inside repo", email);
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      console.log("responde in repo", user);
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

export default UserRepo;

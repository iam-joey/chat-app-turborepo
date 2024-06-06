import { Request, Response, NextFunction } from "express";
import {
  LoginSchemaType,
  UserValidationSchemaType,
  loginSchema,
  userSchema,
} from "@repo/common/userValidation";
import httpStatus from "http-status";
import { RoomService, UserService } from "../service";
import ServiceError from "../utils/customError";

const user = new UserService();
const room = new RoomService();

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userBody: UserValidationSchemaType = userSchema.parse(req.body);

    const response = await user.createUser(userBody);
    return res.status(httpStatus.CREATED).json({
      data: response,
      err: {},
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userBody: LoginSchemaType = loginSchema.parse(req.body);

    const response = await user.loginUser(userBody);
    console.log("response came", response);
    console.log("session id is", req.sessionID);
    //@ts-ignore
    req.session.visited = true;
    res.cookie("token", response);
    return res.status(201).json({
      msg: "Logged IN",
      err: {},
    });
  } catch (err) {
    next(err);
  }
};

export const generateURL = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const { userId } = req.user;
    if (!userId) {
      throw new ServiceError(
        "NOT_FOUND",
        "UserId Invalid",
        httpStatus.UNAUTHORIZED
      );
    }
    const response = await room.createRoom(userId);
    return res.status(httpStatus.CREATED).json({
      data: response,
      err: {},
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const token = await user.me(req.user);
    console.log("asdasdsadasd", token);
    return res.status(httpStatus.CREATED).json({
      data: token,
      msg: "All good",
      err: {},
    });
  } catch (error) {}
};

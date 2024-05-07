import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken";
import httpStatus from "http-status";
import { envVariables } from "../utils/env";

const jwtKey = envVariables.JWT_SECRET;
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    console.log("session is", req.session);
    console.log("session is", req.sessionStore);
    console.log("session is", req.sessionID);
    if (!token) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: "Unauthorized", message: "Token missing" });
    }
    const decoded = await JWT.verify(token, jwtKey);
    //@ts-ignore
    req.user = decoded;
    //@ts-ignore
    console.log(req.user);
    next();
  } catch (error) {
    //@ts-ignore
    if (error.name === "TokenExpiredError") {
      return (
        res
          .status(httpStatus.UNAUTHORIZED)
          //@ts-ignore
          .json({ error: "Unauthorized", message: error.message })
      );
    }
    next(error);
  }
};

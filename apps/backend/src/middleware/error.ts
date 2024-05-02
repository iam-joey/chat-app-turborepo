import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { z } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof z.ZodError) {
    console.log("zod error");
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: `${err.issues[0]?.path[0]} ${err.issues[0]?.message}` });
  }

  return res
    .status(err.statusCode)
    .json({ name: err.name, message: err.message });
};

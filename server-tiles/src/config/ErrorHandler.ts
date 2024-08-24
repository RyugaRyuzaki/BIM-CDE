import {NextFunction, Request, Response} from "express";
export const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errStatus = err.statusCode || 500;
  const errMsg = err.message;
  res.status(errStatus).json({
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
};

export const forbidden = (message: string) => {
  return {statusCode: 403, message};
};
export const conflict = (message: string) => {
  return {statusCode: 409, message};
};
export const notFound = (message: string) => {
  return {statusCode: 404, message};
};

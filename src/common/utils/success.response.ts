// import { Response } from "express";

import { NextFunction, Request, Response } from "express"

// interface ISuccessResponse {
//   res: Response;
//   statusCode?: number;
//   message?: string;
//   data?: any;
// }

// export const SuccessResponse = ({
//   res,
//   statusCode = 200,
//   message = "Done",
//   data = undefined,
// }: ISuccessResponse) => {
//   res.status(statusCode).json({ message, data });
// };
export const SuccessResponse = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const{ statusCode = 200, message = "Done", data = undefined } =await fn(req, res, next);
    if(res.headersSent){
      res.status(statusCode).json({ message, data });
    }
  }
}
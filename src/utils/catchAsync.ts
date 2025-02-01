import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../types/express";

type AsyncFunction = (req: Request | AuthRequest, res: Response, next: NextFunction) => Promise<any>;

export const catchAsync = (fn: AsyncFunction): AsyncFunction => {
  return async (req: Request | AuthRequest, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next); // Ensure the returned function is async
    } catch (err) {
      next(err);
    }
  };
};

// import type { Request, Response, NextFunction } from "express"
// import type { AuthRequest } from "../types/express"

// type AsyncFunction = (req: Request | AuthRequest, res: Response, next: NextFunction) => Promise<any>

// export const catchAsync = (fn: AsyncFunction): AsyncFunction => {
//   return (req: Request | AuthRequest, res: Response, next: NextFunction) => {
//     Promise.resolve(fn(req, res, next)).catch(next)
//   }
// }


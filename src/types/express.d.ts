import type { Request } from "express"
import type { IUser } from "../models/User"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export interface AuthRequest extends Request {
  user: IUser
}


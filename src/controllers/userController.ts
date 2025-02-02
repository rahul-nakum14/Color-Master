import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as userService from '../services/userService';

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const userId = req.user.id;
  const user = await userService.getUserById(userId);
  res.json(user);
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const userId = req.user.id;
  const updatedUser = await userService.updateUser(userId, req.body);
  res.json(updatedUser);
});
import User, { type IUser } from "../models/User"
import ApiError from "../utils/apiError"

export const getUserById = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select("-password")
  if (!user) {
    throw new ApiError(404, "User not found")
  }
  return user
}

export const updateUser = async (userId: string, updateData: Partial<IUser>): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select("-password")
  if (!user) {
    throw new ApiError(404, "User not found")
  }
  return user
}


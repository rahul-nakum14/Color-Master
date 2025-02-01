import express from "express"
import authRoutes from "./v1/auth"
import userRoutes from "./v1/user"

const router = express.Router()

router.use("/auth", authRoutes)
router.use("/users", userRoutes)

export default router


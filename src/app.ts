import express, { type Express } from "express"
import helmet from "helmet"
import cors from "cors"
// import rateLimit from "express-rate-limit"
import routes from "./routes"
import { errorHandler } from "./middleware/errorHandler"
import { connectDB } from "./config/database"
import dotenv from "dotenv";
dotenv.config(); // Load .env file if present

const app: Express = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
// })
// app.use(limiter)

// Routes
app.use("/api/v1", routes)

// Error handling middleware
app.use(errorHandler)

export default app


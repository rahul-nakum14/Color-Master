import mongoose from "mongoose"
import logger from "./logger"

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
        dbName: "color-master",
      });    
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error)
    process.exit(1)
  }
}


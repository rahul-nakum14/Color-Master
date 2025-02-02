import app from "./app"
import { config } from "./config/config"
import logger from "./config/logger"


const port = config.PORT || 3000; // Use the number directly

app.listen(port, () => {
  logger.info(`Server running on port ${port}`)
})


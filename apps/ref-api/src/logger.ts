import { initializeLogger } from "@rabbitswap/logger"

import { ENV } from "@/env"

const [pinoLogger, Logger] = initializeLogger(ENV.ENVIRONMENT)

export { Logger, pinoLogger }
export default Logger

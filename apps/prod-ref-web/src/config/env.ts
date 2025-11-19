import { rabbitApiUrl } from "@/api/core"

type ENV = "production" | "development"

export const APP_ENV: ENV = rabbitApiUrl.includes("dev") ? "development" : "production"

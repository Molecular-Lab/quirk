package main

import (
	"log"

	telegrambot "defai-telegram-bot/handler"
	"defai-telegram-bot/internal/config"
)

func main() {
	cfg := config.ConfigLoader()

	handler, err := telegrambot.NewHandler(cfg)
	if err != nil {
		log.Fatal("Failed to create telegram handler:", err)
	}

	log.Println("Telegram bot is starting...")
	handler.Start()
}

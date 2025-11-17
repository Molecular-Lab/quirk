package tgcommand

import (
	"log"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func HandleStart(sender MessageSender, message *tgbotapi.Message) {
	log.Println("bot start request")
	err := sender.SendMessage(message.Chat.ID, "Bot started")
	if err != nil {
		log.Printf("Error sending message: %v", err)
	}
}

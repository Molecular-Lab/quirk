package tgcommand

import (
	"log"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func HandleAssets(sender MessageSender, message *tgbotapi.Message) {
	log.Println("wait for execution")
	err := sender.SendMessage(message.Chat.ID, "Assets functionality not implemented")
	if err != nil {
		log.Printf("Error sending message: %v", err)
	}
}
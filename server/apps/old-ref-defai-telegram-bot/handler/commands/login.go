package tgcommand

import (
	"log"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func HandleLogin(sender MessageSender, message *tgbotapi.Message) {
	log.Println("wait for execution")
	err := sender.SendMessage(message.Chat.ID, "Login functionality not implemented")
	if err != nil {
		log.Printf("Error sending message: %v", err)
	}
}
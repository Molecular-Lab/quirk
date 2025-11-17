package tgcommand

import (
	"log"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func HandleHelp(sender MessageSender, message *tgbotapi.Message) {
	helpText := `Available commands:
/start - Start the bot
/help - Show this help message
/login - Login functionality
/deposit - Deposit functionality
/agent - Agent functionality
/stake - Stake functionality
/assets - View your assets
/activity - View your activity`

	err := sender.SendMessage(message.Chat.ID, helpText)
	if err != nil {
		log.Printf("Error sending message: %v", err)
	}
}
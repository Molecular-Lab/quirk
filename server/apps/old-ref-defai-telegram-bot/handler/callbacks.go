package telegrambot

import (
	"log"
	"strings"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func (h *Handler) handleCallbackQuery(query *tgbotapi.CallbackQuery) {
	chatID := query.Message.Chat.ID
	messageID := query.Message.MessageID
	data := query.Data

	log.Printf("Received callback query: %s", data)

	if data == "cancel" {
		h.handleCancel(chatID, messageID)
	} else if strings.HasPrefix(data, "confirm_") {
		h.handleConfirm(chatID, messageID, data)
	}

	// Answer the callback query to remove loading state
	callback := tgbotapi.NewCallback(query.ID, "")
	if _, err := h.botService.Request(callback); err != nil {
		log.Printf("Error answering callback query: %v", err)
	}
}

func (h *Handler) handleCancel(chatID int64, messageID int) {
	edit := tgbotapi.NewEditMessageText(chatID, messageID, "Cancelled")
	if _, err := h.botService.Send(edit); err != nil {
		log.Printf("Error editing message: %v", err)
	}
}

func (h *Handler) handleConfirm(chatID int64, messageID int, data string) {
	// TODO: Parse user ID and strategy ID from callback data
	// TODO: Call BackendApiClient.executeStrategy()
	// TODO: Show execution progress
	// TODO: Display transaction results with gas/fee breakdown

	edit := tgbotapi.NewEditMessageText(chatID, messageID, "Execution not implemented")
	if _, err := h.botService.Send(edit); err != nil {
		log.Printf("Error editing message: %v", err)
	}
}

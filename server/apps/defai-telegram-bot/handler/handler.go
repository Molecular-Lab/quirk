package telegrambot

import (
	"log"

	config "defai-telegram-bot/internal/config"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

// Handler orchestrates message routing and command execution
type Handler struct {
	botService *BotService
}

func NewHandler(cfg config.Config) (*Handler, error) {
	botService, err := NewBotService(cfg)
	if err != nil {
		return nil, err
	}

	log.Printf("Authorized on account %s", botService.GetBot().Self.UserName)
	h := &Handler{
		botService: botService,
	}

	return h, nil
}

func (h *Handler) Start() {
	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60

	updates := h.botService.GetUpdatesChan(u)

	for update := range updates {
		if update.Message != nil {
			go h.handleMessage(update.Message)
		}

		if update.CallbackQuery != nil {
			go h.handleCallbackQuery(update.CallbackQuery)
		}
	}
}

func (h *Handler) handleMessage(message *tgbotapi.Message) {
	if message.Text == "" {
		return
	}
	log.Printf("[%s] %s", message.From.UserName, message.Text)
	text := message.Text

	switch text {
	case "/start":
		h.botService.commands.HandleStart(message)
	case "/help":
		h.botService.commands.HandleHelp(message)
	case "/login":
		h.botService.commands.HandleLogin(message)
	case "/deposit":
		h.botService.commands.HandleDeposit(message)
	case "/agent":
		h.botService.commands.HandleAgent(message)
	case "/stake":
		h.botService.commands.HandleStake(message)
	case "/assets":
		h.botService.commands.HandleAssets(message)
	case "/activity":
		h.botService.commands.HandleActivity(message)
	default:
		if text[0] != '/' {
			log.Printf("Received message from %s: %s", message.From.UserName, message.Text)
		}
	}
}

func (h *Handler) SendMessage(chatID int64, text string) error {
	return h.botService.SendMessage(chatID, text)
}

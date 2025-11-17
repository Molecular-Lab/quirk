package telegrambot

import (
	tgcommand "defai-telegram-bot/handler/commands"
	config "defai-telegram-bot/internal/config"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

// BotService handles low-level bot interactions and configuration
type BotService struct {
	bot      *tgbotapi.BotAPI
	commands *tgcommand.Commands
}

func NewBotService(cfg config.Config) (*BotService, error) {
	bot, err := tgbotapi.NewBotAPI(cfg.Telegram.BotToken)
	if err != nil {
		return nil, err
	}
	bot.Debug = cfg.Server.Debug

	bs := &BotService{
		bot: bot,
	}
	bs.commands = tgcommand.NewCommands(bs)
	return bs, nil
}

func (bs *BotService) GetBot() *tgbotapi.BotAPI {
	return bs.bot
}

func (bs *BotService) GetUpdatesChan(u tgbotapi.UpdateConfig) tgbotapi.UpdatesChannel {
	return bs.bot.GetUpdatesChan(u)
}

func (bs *BotService) SendMessage(chatID int64, text string) error {
	msg := tgbotapi.NewMessage(chatID, text)
	_, err := bs.bot.Send(msg)
	return err
}

func (bs *BotService) SendMessageWithKeyboard(chatID int64, text string, keyboard interface{}) error {
	msg := tgbotapi.NewMessage(chatID, text)
	msg.ReplyMarkup = keyboard
	_, err := bs.bot.Send(msg)
	return err
}

func (bs *BotService) Send(c tgbotapi.Chattable) (tgbotapi.Message, error) {
	return bs.bot.Send(c)
}

func (bs *BotService) Request(c tgbotapi.Chattable) (*tgbotapi.APIResponse, error) {
	return bs.bot.Request(c)
}

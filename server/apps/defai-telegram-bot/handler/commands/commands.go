package tgcommand

import tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

type MessageSender interface {
	SendMessage(chatID int64, text string) error
}

type Commands struct {
	sender MessageSender
}

func NewCommands(sender MessageSender) *Commands {
	return &Commands{
		sender: sender,
	}
}

func (c *Commands) HandleStart(message *tgbotapi.Message) {
	HandleStart(c.sender, message)
}

func (c *Commands) HandleHelp(message *tgbotapi.Message) {
	HandleHelp(c.sender, message)
}

func (c *Commands) HandleLogin(message *tgbotapi.Message) {
	HandleLogin(c.sender, message)
}

func (c *Commands) HandleDeposit(message *tgbotapi.Message) {
	HandleDeposit(c.sender, message)
}

func (c *Commands) HandleAgent(message *tgbotapi.Message) {
	HandleAgent(c.sender, message)
}

func (c *Commands) HandleStake(message *tgbotapi.Message) {
	HandleStake(c.sender, message)
}

func (c *Commands) HandleAssets(message *tgbotapi.Message) {
	HandleAssets(c.sender, message)
}

func (c *Commands) HandleActivity(message *tgbotapi.Message) {
	HandleActivity(c.sender, message)
}
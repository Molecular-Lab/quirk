package config

import (
	"errors"
	"log"
	"path/filepath"
	"sync"

	"github.com/spf13/viper"
)

type TelegramBotConfig struct {
	BotToken string `mapstructure:"bot_token"`
}

type DefaiServer struct {
	ApiUrl string `mapstructure:"api_url"`
	ApiKey string `mapstructure:"api_key"`
	Debug  bool   `mapstructure:"debug"`
}

type Config struct {
	Telegram TelegramBotConfig `mapstructure:"telegram_bot"`
	Server   DefaiServer       `mapstructure:"defai_server"`
}

const DefaultConfigPath = "."

var (
	isInit bool
	mu     sync.Mutex
	config = &Config{
		Telegram: TelegramBotConfig{
			BotToken: "",
		},
		Server: DefaiServer{
			ApiUrl: "",
			ApiKey: "",
			Debug:  false,
		},
	}
)

func ConfigLoader() Config {
	mu.Lock()
	defer mu.Unlock()
	if isInit {
		return *config
	}
	return ConfigParser()
}

func ConfigParser() Config {
	configPath, err := filepath.Abs(DefaultConfigPath)
	if err != nil {
		log.Fatal("Failed to resolve config path:", err)
	}
	viper.AddConfigPath(configPath)
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		var errNotFound viper.ConfigFileNotFoundError
		if errors.As(err, &errNotFound) {
			log.Println("Config file not found, using defaults and environment variables")
		} else {
			log.Fatal("Error reading config file:", err)
		}
	}

	if err := viper.Unmarshal(&config); err != nil {
		log.Fatal("Failed to unmarshal config:", err)
	}

	if config.Telegram.BotToken == "" {
		log.Fatal("BOT_TOKEN is required. Set TELEGRAM_BOT_BOT_TOKEN environment variable")
	}
	isInit = true
	return *config
}

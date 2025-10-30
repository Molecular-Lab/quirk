package config

import (
	"errors"
	"log"
	"sync"
	"time"

	"github.com/WTCHAI/proxify/pkg/postgres"
	"github.com/spf13/viper"
)

type Config struct {
	Database postgres.PGConfig `mapstructure:"database"`
	Server   ServerConfig      `mapstructure:"server"`
}

type ServerConfig struct {
	Port           int           `mapstructure:"port"`
	Timeout        time.Duration `mapstructure:"timeout"`
	ReadBufferSize int           `mapstructure:"read_buffer_size"`
}

const DefaultConfigPath = "."

var (
	isInit bool
	mu     sync.Mutex
	config = &Config{
		Database: postgres.PGConfig{
			Host:    "localhost",
			Port:    "5432",
			SSLMode: "disable",
		},
		Server: ServerConfig{
			Port:           8080,
			Timeout:        30 * time.Second,
			ReadBufferSize: 8 * 1024,
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
	viper.AddConfigPath(DefaultConfigPath)
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		var errNotfound viper.ConfigFileNotFoundError
		if errors.As(err, &errNotfound) {
			log.Println("Config file not found, using defaults and environment variables")
		} else {
			log.Fatal("Error reading config file:", err)
		}
	}

	// Unmarshal config into struct
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatal("Failed to unmarshal config:", err)
	}

	isInit = true
	return *config
}

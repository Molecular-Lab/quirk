package entity

import (
	"github.com/google/uuid"
)

type User struct {
	ID            uuid.UUID `json:"id"`
	WalletAddress string    `json:"walletAddress"`
	Name          string    `json:"name"`
	Email         string    `json:"email"`
}

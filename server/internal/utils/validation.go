package utils

import (
	"net/mail"
	"unicode"

	ethcommon "github.com/ethereum/go-ethereum/common"
	"github.com/google/uuid"
)

func IsValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

func IsValidEthAddress(address string) bool {
	return ethcommon.IsHexAddress(address)
}

func IsStartWithUpper(s string) bool {
	return len(s) > 0 && unicode.IsUpper(rune(s[0]))
}

func ParseUUID(keyword string) (uuid.UUID, error) {
	parsed, err := uuid.Parse(keyword)
	return parsed, err
}

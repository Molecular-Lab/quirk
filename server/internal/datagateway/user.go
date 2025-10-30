package datagateway

import (
	"context"

	"github.com/WTCHAI/proxify/internal/entity"
	"github.com/WTCHAI/proxify/internal/gen"
	"github.com/google/uuid"
)

type UserDataGateway interface {
	GetUsers(ctx context.Context) ([]entity.User, error)
	GetUserByWalletAddress(ctx context.Context, address string) (*entity.User, error)

	CreateUser(ctx context.Context, params gen.CreateUserParams) (*entity.User, error)
	UpdateUser(ctx context.Context, params gen.UpdateUserByAddressParams) (*entity.User, error)

	DeleteUserByAddress(ctx context.Context, walletAddress string) (int64, error)
	DeleteUserById(ctx context.Context, userId uuid.UUID) (int64, error)
}

package postgres

import (
	"github.com/WTCHAI/proxify/internal/entity"
	"github.com/WTCHAI/proxify/internal/gen"
)

func UserModelToEntity(sqlcUser *gen.User) *entity.User {
	return &entity.User{
		ID:            sqlcUser.ID,
		WalletAddress: sqlcUser.WalletAddress,
		Name:          sqlcUser.Name,
		Email:         sqlcUser.Email,
	}
}

func UsersModelToEntity(sqlcUsers []gen.User) []entity.User {
	users := make([]entity.User, len(sqlcUsers))
	for i, sqlcUser := range sqlcUsers {
		users[i] = *UserModelToEntity(&sqlcUser)
	}
	return users
}

func UserEntityToCreateParams(u entity.User) gen.CreateUserParams {
	return gen.CreateUserParams{
		WalletAddress: u.WalletAddress,
		Name:          u.Name,
		Email:         u.Email,
	}
}

func UserEntityToUpdateParams(u entity.User) gen.UpdateUserByAddressParams {
	return gen.UpdateUserByAddressParams{
		WalletAddress: u.WalletAddress,
		Name:          u.Name,
	}
}

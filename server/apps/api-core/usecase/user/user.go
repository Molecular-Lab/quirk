package user

import (
	"context"
	"errors"
	"sync"

	"github.com/WTCHAI/proxify/internal/entity"
	"github.com/WTCHAI/proxify/internal/gen"
	"github.com/google/uuid"
)

func (uc *UserUsecase) GetUsers(ctx context.Context) ([]entity.User, error) {
	return uc.userDg.GetUsers(ctx)
}

func (uc *UserUsecase) GetAllPrefixUsers(ctx context.Context) ([]entity.User, error) {
	users, err := uc.userDg.GetUsers(ctx)
	if err != nil {
		return nil, err
	}

	for i := range users {
		users[i].Name = "Yoooo! " + users[i].Name
	}

	return users, nil
}

func (uc *UserUsecase) GetAllRoutinePrefixUsers(ctx context.Context) ([]entity.User, error) {
	users, err := uc.userDg.GetUsers(ctx)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup

	for i := range users {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			users[index].Name = "Yoooo! " + users[index].Name
			users[index].Name = users[index].Name + "  Yoooo!"
		}(i)
	}
	wg.Wait()
	return users, nil
}

func (uc *UserUsecase) GetUserByWallet(ctx context.Context, address string) (*entity.User, error) {
	if address == "" {
		return nil, errors.New("Ivalid Address")
	}
	user, err := uc.userDg.GetUserByWalletAddress(ctx, address)
	user.Name += "adding suffix"

	return user, err
}

func (uc *UserUsecase) CreateUser(ctx context.Context, params gen.CreateUserParams) (*entity.User, error) {
	return uc.userDg.CreateUser(ctx, params)
}

func (uc *UserUsecase) UpdateUser(ctx context.Context, params gen.UpdateUserByAddressParams) (*entity.User, error) {
	return uc.userDg.UpdateUser(ctx, params)
}

func (uc *UserUsecase) DeleteUserByAddress(ctx context.Context, walletAddress string) (int64, error) {
	return uc.userDg.DeleteUserByAddress(ctx, walletAddress)
}

func (uc *UserUsecase) DeleteUserById(ctx context.Context, userId uuid.UUID) (int64, error) {
	return uc.userDg.DeleteUserById(ctx, userId)
}

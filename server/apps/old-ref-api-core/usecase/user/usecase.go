package user

import (
	"github.com/WTCHAI/proxify/internal/datagateway"
	"golang.org/x/sync/singleflight"
)

type UserUsecase struct {
	userDg datagateway.UserDataGateway
	sf     singleflight.Group
}

type NewUserUsecaseParams struct {
	UserDataGateway datagateway.UserDataGateway
}

func NewUserUsecase(userDgParam NewUserUsecaseParams) *UserUsecase {
	return &UserUsecase{
		userDg: userDgParam.UserDataGateway,
		sf:     singleflight.Group{},
	}
}

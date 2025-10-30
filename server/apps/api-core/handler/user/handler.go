package user

import (
	userusecase "github.com/WTCHAI/proxify/apps/api-core/usecase/user"
)

type UserHandler struct {
	userUsecase *userusecase.UserUsecase
}

func NewUserHandler(userUsecase *userusecase.UserUsecase) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
	}
}

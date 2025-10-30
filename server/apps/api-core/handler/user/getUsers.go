package user

import (
	"net/http"

	"github.com/WTCHAI/proxify/common"
	"github.com/gofiber/fiber/v2"
)

func (h *UserHandler) GetAllUsers(ctx *fiber.Ctx) error {
	users, err := h.userUsecase.GetUsers(ctx.Context())
	if err != nil {
		return ctx.Status(http.StatusInternalServerError).JSON(common.HttpResponse{
			Error: err.Error(),
		})
	}

	return ctx.JSON(common.HttpResponse{
		Response: users,
	})
}

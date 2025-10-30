package user

import (
	"log"
	"net/http"

	"github.com/WTCHAI/proxify/common"
	"github.com/WTCHAI/proxify/internal/gen"
	"github.com/gofiber/fiber/v2"
)

func (h *UserHandler) NewUser(ctx *fiber.Ctx) error {
	log.Println("🔥 NewUser handler called")
	var req NewUserRequest
	if err := req.ParserReq(ctx); err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(common.HttpResponse{
			Error: err.Error(),
		})
	}
	log.Println("params")
	params := gen.CreateUserParams{
		WalletAddress: req.WalletAddress,
		Name:          req.Name,
		Email:         req.Email,
	}

	log.Println("params ", params)

	user, err := h.userUsecase.CreateUser(ctx.Context(), params)

	if err != nil {
		return ctx.Status(http.StatusInternalServerError).JSON(common.HttpResponse{
			Error: err.Error(),
		})
	}

	response := NewUserResponse{
		UserID:        user.ID,
		WalletAddress: user.WalletAddress,
		Name:          user.Name,
		Email:         user.Email,
	}

	return ctx.JSON(common.HttpResponse{
		Response: response,
	})
}

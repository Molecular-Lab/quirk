package user

import (
	"net/http"

	"github.com/WTCHAI/proxify/common"
	"github.com/gofiber/fiber/v2"
)

func (h *UserHandler) GetUserByWallet(ctx *fiber.Ctx) error {
	var req GetUserByWalletRequest

	if err := req.ParseReq(ctx); err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(common.HttpResponse{
			Error: err.Error(),
		})
	}

	user, err := h.userUsecase.GetUserByWallet(ctx.Context(), req.WalletAddress)
	if err != nil {
		return ctx.Status(http.StatusInternalServerError).JSON(common.HttpResponse{
			Error: err.Error(),
		})
	}

	response := GetUserByWalletResponse{
		UserID:        user.ID,
		WalletAddress: user.WalletAddress,
		Name:          user.Name,
		Email:         user.Email,
	}

	return ctx.JSON(common.HttpResponse{
		Response: response,
	})
}

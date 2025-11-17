package user

import (
	"net/http"

	"github.com/WTCHAI/proxify/common"
	"github.com/gofiber/fiber/v2"
)

func (h *UserHandler) DeleteUser(ctx *fiber.Ctx) error {
	var req DeleteUserRequest
	if err := req.ParserReq(ctx); err != nil {
		return ctx.Status(http.StatusBadRequest).JSON(common.HttpResponse{
			Error: err.Error(),
		})
	}

	var rowEffected int64
	var err error
	parsedUUID, uuidErr := req.UUIDParser(req.Identifier)

	isAddressValid := req.IsValidEthAddress(req.Identifier)
	isUUIDValid := uuidErr == nil

	if isAddressValid {
		rowEffected, err = h.userUsecase.DeleteUserByAddress(ctx.Context(), req.Identifier)
	} else if isUUIDValid {
		rowEffected, err = h.userUsecase.DeleteUserById(ctx.Context(), parsedUUID)
	} else {
		return ctx.Status(http.StatusBadRequest).JSON(common.HttpResponse{
			Error: "Invalid identifier format",
		})
	}

	if err != nil {
		return ctx.Status(http.StatusInternalServerError).JSON(common.HttpResponse{
			Error: err.Error(),
		})
	}

	response := DeleteUserResponse{
		Deleted: rowEffected,
	}

	return ctx.JSON(common.HttpResponse{
		Response: response,
	})
}

package user

import (
	"github.com/WTCHAI/proxify/internal/utils"
	"github.com/cockroachdb/errors"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/moonrhythm/validator"
)

// Getter funciton
type GetUserByWalletRequest struct {
	WalletAddress string `params:"Address" validate:"required"`
}

type GetUserByWalletResponse struct {
	UserID        uuid.UUID `json:"Id"`
	WalletAddress string    `json:"Address"`
	Name          string    `json:"Name"`
	Email         string    `json:"Email"`
}

func (r *GetUserByWalletRequest) ValidateParser() error {
	v := validator.New()
	v.Must(r.WalletAddress != "", "address is required")

	return errors.WithStack(v.Error())
}

func (r *GetUserByWalletRequest) ParseReq(ctx *fiber.Ctx) error {
	if err := ctx.ParamsParser(r); err != nil {
		return errors.Wrap(err, "invalid request params")
	}

	if err := ctx.QueryParser(r); err != nil {
		return errors.Wrap(err, "invalid request queries")
	}

	if err := r.ValidateParser(); err != nil {
		return errors.WithStack(err)
	}

	return nil
}

// Setter function
type NewUserRequest struct {
	WalletAddress string `json:"WalletAddress" validate:"required"`
	Name          string `json:"Name" validate:"required"`
	Email         string `json:"Email" validate:"required,email"`
}

type NewUserResponse struct {
	UserID        uuid.UUID `json:"Id"`
	WalletAddress string    `json:"WalletAddress"`
	Name          string    `json:"Name"`
	Email         string    `json:"Email"`
}

func (r *NewUserRequest) ValidateParser() error {
	v := validator.New()

	v.Must(r.WalletAddress != "", "Wallet address is required")
	v.Must(utils.IsValidEthAddress(r.WalletAddress), "Invalid Wallet address")

	v.Must(r.Email != "", "Email is required")
	v.Must(utils.IsValidEmail(r.Email), "Invalid email format")

	v.Must(r.Name != "", "Name field is required")
	v.Must(utils.IsStartWithUpper(r.Name), "Name required first uppercases")
	return errors.WithStack(v.Error())
}

func (r *NewUserRequest) ParserReq(ctx *fiber.Ctx) error {
	if err := ctx.BodyParser(r); err != nil {
		return errors.Wrap(err, "Invalid body")
	}

	if err := r.ValidateParser(); err != nil {
		return errors.WithStack(err)
	}

	return nil
}

// Delete function
type DeleteUserRequest struct {
	Identifier string `params:"identifier" validate:"required"`
}

type DeleteUserResponse struct {
	Deleted int64 `json:"deleted"`
}

func (r *DeleteUserRequest) ValidateParser() error {
	v := validator.New()

	v.Must(r.Identifier != "", "identifier is required")

	isAddressValid := r.IsValidEthAddress(r.Identifier)
	_, uuidErr := r.UUIDParser(r.Identifier)
	isUUIDValid := uuidErr == nil

	v.Must((isAddressValid || isUUIDValid), "identifier must be valid format")
	return errors.WithStack(v.Error())
}

func (r *DeleteUserRequest) ParserReq(ctx *fiber.Ctx) error {
	if err := ctx.ParamsParser(r.Identifier); err != nil {
		return errors.WithStack(err)
	}

	if err := r.ValidateParser(); err != nil {
		return errors.WithStack(err)
	}

	return nil
}

func (r *DeleteUserRequest) UUIDParser(identifier string) (uuid.UUID, error) {
	parsed, err := utils.ParseUUID(identifier)
	return parsed, err
}

func (r *DeleteUserRequest) IsValidEthAddress(identifier string) bool {
	return utils.IsValidEthAddress(identifier)
}

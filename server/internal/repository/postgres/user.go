package postgres

import (
	"context"

	"github.com/WTCHAI/proxify/internal/datagateway"
	"github.com/WTCHAI/proxify/internal/entity"
	"github.com/WTCHAI/proxify/internal/gen"
	"github.com/cockroachdb/errors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var _ datagateway.UserDataGateway = (*Repository)(nil)

func (r *Repository) GetUsers(ctx context.Context) ([]entity.User, error) {
	model, err := r.queries.GetUsers(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.WithStack(errors.New("User not found"))
		}
		return nil, errors.Wrap(err, "error during query")
	}
	return UsersModelToEntity(model), nil
}

func (r *Repository) GetUserByWalletAddress(ctx context.Context, address string) (*entity.User, error) {
	model, err := r.queries.GetUserByWallet(ctx, address)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.WithStack(errors.New("User not found"))
		}
		return nil, errors.Wrap(err, "error during query")
	}

	return UserModelToEntity(&model), nil
}

func (r *Repository) CreateUser(ctx context.Context, params gen.CreateUserParams) (*entity.User, error) {
	model, err := r.queries.CreateUser(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.WithStack(errors.New("Create user not success"))
		}
		return nil, errors.Wrap(err, "error during query")
	}

	return UserModelToEntity(&model), nil
}

func (r *Repository) UpdateUser(ctx context.Context, params gen.UpdateUserByAddressParams) (*entity.User, error) {
	model, err := r.queries.UpdateUserByAddress(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.WithStack(errors.New("User not found"))
		}
		return nil, errors.Wrap(err, "error during query")
	}
	return UserModelToEntity(&model), nil
}

func (r *Repository) DeleteUserByAddress(ctx context.Context, walletAddress string) (int64, error) {
	rowsAffected, err := r.queries.DeleteUserByAddress(ctx, walletAddress)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, errors.WithStack(errors.New("User not found"))
		}
		return 0, errors.Wrap(err, "error during query")
	}
	return rowsAffected, nil
}

func (r *Repository) DeleteUserById(ctx context.Context, userId uuid.UUID) (int64, error) {
	rowsAffected, err := r.queries.DeleteUserById(ctx, userId)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, errors.WithStack(errors.New("User not found"))
		}
		return 0, errors.Wrap(err, "error during query")
	}
	return rowsAffected, nil
}

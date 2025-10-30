package postgres

import (
	"github.com/WTCHAI/proxify/internal/gen"
	"github.com/WTCHAI/proxify/pkg/postgres"
)

type Repository struct {
	db      postgres.DB
	queries *gen.Queries
}

func NewRepository(db postgres.DB) *Repository {
	return &Repository{
		db:      db,
		queries: gen.New(db),
	}
}

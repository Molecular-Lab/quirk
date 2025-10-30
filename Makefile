migrateup:
	migrate -path database/migrations -database	"postgres://go_monorepo_postgres:go_monorepo_password@localhost:5432/go_monorepo_dev?sslmode=disable" -verbose up

migratedown:
	migrate -path database/migrations -database	"postgres://go_monorepo_postgres:go_monorepo_password@localhost:5432/go_monorepo_dev?sslmode=disable" -verbose down

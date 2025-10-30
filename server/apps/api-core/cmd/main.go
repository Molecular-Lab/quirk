package main

import (
	"context"
	"fmt"
	"log"

	userhandler "github.com/WTCHAI/proxify/apps/api-core/handler/user"
	userusercase "github.com/WTCHAI/proxify/apps/api-core/usecase/user"
	"github.com/WTCHAI/proxify/common"
	"github.com/WTCHAI/proxify/internal/config"
	"github.com/WTCHAI/proxify/internal/repository/postgres"
	pkgpostgres "github.com/WTCHAI/proxify/pkg/postgres"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	conf := config.ConfigLoader()

	// Debug: Print config values
	log.Printf("🔧 Config Debug:")
	log.Printf("   Database Host: %s", conf.Database.Host)
	log.Printf("   Database Port: %s", conf.Database.Port)
	log.Printf("   Database User: %s", conf.Database.User)
	log.Printf("   Database Name: %s", conf.Database.DBName)
	log.Printf("   Server Port: %d", conf.Server.Port)
	log.Printf("   Password: %s", conf.Database.Password)

	ctx := context.Background()

	// Connect to database
	dbConn, err := pkgpostgres.NewDBPool(ctx, conf.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer func() {
		dbConn.Close()
		log.Fatal("Gracefully closed connection")
	}()
	log.Println("✅ Database connected successfully")

	dbRepository := postgres.NewRepository(dbConn)

	userUsecases := userusercase.NewUserUsecase(userusercase.NewUserUsecaseParams{
		UserDataGateway: dbRepository,
	})
	log.Println("✅ User usecase initialized")
	userHandler := userhandler.NewUserHandler(userUsecases)
	log.Println("✅ User handler initialized")

	// Create Fiber app with error handling
	app := fiber.New(fiber.Config{
		AppName: "go-monorepo-api",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			log.Printf("❌ Unhandled error: %v", err)
			return c.Status(500).JSON(common.HttpResponse{
				Error: "internal server error",
			})
		},
	})

	// Add middleware
	app.Use(recover.New())
	app.Use(cors.New())
	app.Use(logger.New())

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		// Test database connection
		if err := dbConn.Ping(ctx); err != nil {
			return c.Status(503).JSON(common.HttpResponse{
				Error: "database unavailable",
			})
		}
		return c.JSON(common.HttpResponse{
			Response: map[string]string{
				"status":   "ok",
				"database": "connected",
			},
		})
	})

	// Test endpoint
	app.Get("/test", func(c *fiber.Ctx) error {
		return c.JSON(common.HttpResponse{
			Response: map[string]interface{}{
				"message":  "Hello from type-safe API!",
				"version":  "v1.0.0",
				"database": "connected",
			},
		})
	})

	log.Println("mounting user handlering")
	userHandler.Mount(app)

	// Start server
	serverAddr := fmt.Sprintf(":%d", conf.Server.Port)
	log.Printf("🚀 Server starting on port %d", conf.Server.Port)
	log.Printf("📋 Available endpoints:")
	log.Fatal(app.Listen(serverAddr))
}

package user

import (
	"github.com/gofiber/fiber/v2"
)

func (h *UserHandler) Mount(router fiber.Router) {
	g := router.Group("/users")
	g.Get("/", h.GetAllUsers)
	g.Get("/:address", h.GetUserByWallet)
	g.Post("/create", h.NewUser)
	g.Delete("/:identifier", h.DeleteUser)
}

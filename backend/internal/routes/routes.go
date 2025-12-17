// backend/internal/routes/routes.go
package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sohamify/advanced-todo-app/backend/internal/handlers"
	"github.com/sohamify/advanced-todo-app/backend/internal/middleware"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	// Auth routes (public)
	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)

	// Protected todo routes
	todos := api.Group("/todos")
	todos.Use(middleware.AuthMiddleware)
	todos.Get("/", handlers.GetTodos)
	todos.Post("/", handlers.CreateTodo)
	todos.Put("/:id", handlers.UpdateTodo)
	todos.Delete("/:id", handlers.DeleteTodo)
}

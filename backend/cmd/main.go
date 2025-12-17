// backend/cmd/main.go
package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/sohamify/advanced-todo-app/backend/internal/routes"
	"github.com/sohamify/advanced-todo-app/backend/internal/services"
)

func main() {
	services.InitDB()
	app := fiber.New()

	// Enable CORS for frontend (adjust origins as needed)
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	routes.Setup(app)

	log.Fatal(app.Listen(":3001")) // Backend on port 3001
}

// backend/internal/middleware/auth.go
package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/sohamify/advanced-todo-app/backend/internal/handlers"
)

var jwtSecretMiddleware = []byte(os.Getenv("JWT_SECRET"))

func AuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Authorization header required"})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.ParseWithClaims(tokenString, &handlers.Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecretMiddleware, nil
	})

	if err != nil || !token.Valid {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired token"})
	}

	claims, ok := token.Claims.(*handlers.Claims)
	if !ok || claims.ExpiresAt.Time.Before(time.Now()) {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired token"})
	}

	c.Locals("userID", claims.UserID)
	fmt.Println("Authenticated user ID:", claims.UserID)
	return c.Next()
}

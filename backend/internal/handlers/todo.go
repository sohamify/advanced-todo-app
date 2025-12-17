// backend/internal/handlers/todo.go
package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sohamify/advanced-todo-app/backend/internal/models"
	"github.com/sohamify/advanced-todo-app/backend/internal/services"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var todoValidate = validator.New()

func GetTodos(c *fiber.Ctx) error {
	userIDHex := c.Locals("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDHex)
	fmt.Print("User Id", userID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Query params for filtering
	priority := c.Query("priority")
	status := c.Query("status")
	search := c.Query("search")
	tags := c.Query("tags") // comma-separated

	filter := bson.M{"userId": userID}
	if priority != "" {
		filter["priority"] = priority
	}
	if status != "" {
		filter["status"] = status
	}
	if search != "" {
		filter["title"] = bson.M{"$regex": search, "$options": "i"}
	}
	if tags != "" {
		filter["tags"] = bson.M{"$in": []string{tags}} // Simple, adjust for multiple
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := services.TodoCollection.Find(ctx, filter, options.Find().SetSort(bson.D{{"deadline", 1}}))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var todos []models.Todo
	if err = cursor.All(ctx, &todos); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	fmt.Print("todo list", todos)

	return c.JSON(todos)
}

func CreateTodo(c *fiber.Ctx) error {
	todo := new(models.Todo)
	if err := c.BodyParser(todo); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := todoValidate.Struct(todo); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	userIDHex := c.Locals("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}
	todo.UserID = userID

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := services.TodoCollection.InsertOne(ctx, todo)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	todo.ID = result.InsertedID.(primitive.ObjectID)
	return c.Status(http.StatusCreated).JSON(todo)
}

func UpdateTodo(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	todo := new(models.Todo)
	if err := c.BodyParser(todo); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := todoValidate.StructPartial(todo); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	userIDHex := c.Locals("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{"$set": bson.M{}}
	if todo.Title != "" {
		update["$set"].(bson.M)["title"] = todo.Title
	}
	if todo.Description != "" {
		update["$set"].(bson.M)["description"] = todo.Description
	}
	if todo.Priority != "" {
		update["$set"].(bson.M)["priority"] = todo.Priority
	}
	if todo.Status != "" {
		update["$set"].(bson.M)["status"] = todo.Status
	}
	if todo.Deadline != "" {
		update["$set"].(bson.M)["deadline"] = todo.Deadline
	}
	if len(todo.Tags) > 0 {
		update["$set"].(bson.M)["tags"] = todo.Tags
	}

	result := services.TodoCollection.FindOneAndUpdate(ctx, bson.M{"_id": id, "userId": userID}, update, options.FindOneAndUpdate().SetReturnDocument(options.After))
	if result.Err() == mongo.ErrNoDocuments {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Todo not found or not authorized"})
	}

	var updatedTodo models.Todo
	if err := result.Decode(&updatedTodo); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(updatedTodo)
}

func DeleteTodo(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	userIDHex := c.Locals("userID").(string)
	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := services.TodoCollection.DeleteOne(ctx, bson.M{"_id": id, "userId": userID})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if result.DeletedCount == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Todo not found or not authorized"})
	}

	return c.JSON(fiber.Map{"message": "Todo deleted successfully"})
}

// backend/internal/services/db.go
package services

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var TodoCollection *mongo.Collection
var UserCollection *mongo.Collection

func InitDB() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	uri := os.Getenv("MONGODB_URI") // For MongoDB Atlas: mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
	if uri == "" {
		log.Fatal("MONGODB_URI not set")
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "todo_db" // Default
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}

	// Ping to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	Client = client
	TodoCollection = Client.Database(dbName).Collection("todos")
	UserCollection = Client.Database(dbName).Collection("users")

	log.Println("Connected to MongoDB Atlas")
}

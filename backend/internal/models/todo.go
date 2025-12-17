package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Todo struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID      primitive.ObjectID `json:"userId" bson:"userId"`
	Title       string             `json:"title" bson:"title" validate:"required"`
	Description string             `json:"description" bson:"description"`
	Priority    string             `json:"priority" bson:"priority" validate:"oneof=low medium high"`
	Status      string             `json:"status" bson:"status" validate:"oneof=pending in-progress completed"`
	Deadline    string             `json:"deadline" bson:"deadline"` // ISO date string
	Tags        []string           `json:"tags" bson:"tags"`
}

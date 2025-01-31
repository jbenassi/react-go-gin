//
// Description: This is a simple REST API server that manages a collection of dogs.
// It supports the following operations:
// - GET /dogs: Get all the dogs
// - POST /dogs: Create a new dog
// - PUT /dogs/:id: Update a dog by ID
// - DELETE /dogs/:id: Delete a dog by ID
//
//  Writting by Jason Benassi 2025

package main

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
)

// Dog represents the model we'll store and manage.
type Dog struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Breed string `json:"breed"`
}

// In-memory store for Dogs (not production-safe!)
var (
	dogs   []Dog
	nextID int        = 1
	mu     sync.Mutex // to safely handle concurrent writes
)

func main() {
	r := gin.Default()

	// Seed some initial data
	dogs = []Dog{
		{ID: 1, Name: "Fido", Breed: "Labrador"},
		{ID: 2, Name: "Rex", Breed: "German Shepherd"},
		{ID: 3, Name: "Bella", Breed: "Golden Retriever"},
	}
	nextID = 4

	// GET all the pups
	r.GET("/dogs", func(c *gin.Context) {
		c.JSON(http.StatusOK, dogs)
	})

	// CREATE a new pup
	r.POST("/dogs", func(c *gin.Context) {
		var newDog Dog
		if err := c.ShouldBindJSON(&newDog); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		mu.Lock()
		newDog.ID = nextID
		nextID++
		dogs = append(dogs, newDog)
		mu.Unlock()

		c.JSON(http.StatusCreated, newDog)
	})

	// UPDATE a dog by ID
	r.PUT("/dogs/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid dog ID"})
			return
		}

		var updatedDog Dog
		if err := c.ShouldBindJSON(&updatedDog); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		mu.Lock()
		defer mu.Unlock()

		for i := range dogs {
			if dogs[i].ID == id {
				dogs[i].Name = updatedDog.Name
				dogs[i].Breed = updatedDog.Breed
				c.JSON(http.StatusOK, dogs[i])
				return
			}
		}

		c.JSON(http.StatusNotFound, gin.H{"error": "dog not found"})
	})

	// DELETE a pup by ID
	r.DELETE("/dogs/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid dog ID"})
			return
		}

		mu.Lock()
		defer mu.Unlock()

		for i, d := range dogs {
			if d.ID == id {
				// Remove the dog from slice
				dogs = append(dogs[:i], dogs[i+1:]...)
				c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("dog %d deleted", id)})
				return
			}
		}

		c.JSON(http.StatusNotFound, gin.H{"error": "dog not found"})
	})

	// Run server on port 8080
	r.Run(":8080")
}

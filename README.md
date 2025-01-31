
# This is a Golang + React example project.
### It is intended to be as simple as possible

### The backend data is in memory only but you could easily switch to using GORM with your favorite database.

## Requirements
- Go 1.22 or higher
    - Gin Gonic v1.10.0 or higher
- Node.js v23.0.0 or higher
    - React 19.0.0 or higher

# The project is divided into two parts:
# client: React frontend

### Simply display our Puppies in a React Table which is editable and deletable.

# server: Golang backend (running Go Gin)

### The server is a simple REST API that serves the Puppies data.

## Instructions
## For Server

    cd server
    go run main.go .

## For Client

    cd client
    npm start
  *This should download required packages and start the client*

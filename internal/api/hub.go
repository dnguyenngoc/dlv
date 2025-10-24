package api

import (
	"encoding/json"
	"log"
)

// Client represents a WebSocket client
type Client struct {
	hub    *WebSocketHub
	conn   *websocket.Conn
	send   chan []byte
}

// WebSocketHub maintains the set of active clients and broadcasts messages
type WebSocketHub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

func NewWebSocketHub() *WebSocketHub {
	return &WebSocketHub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *WebSocketHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client connected. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client disconnected. Total clients: %d", len(h.clients))
			}

		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// BroadcastUpdate sends a lineage update to all connected clients
func (h *WebSocketHub) BroadcastUpdate(data interface{}) {
	message, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling update: %v", err)
		return
	}
	h.broadcast <- message
}


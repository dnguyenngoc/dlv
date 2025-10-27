package api

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
}

// HandleWebSocket handles WebSocket connections for real-time lineage updates
func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
	}

	client.hub.register <- client

	// Send initial connection message
	if err := conn.WriteJSON(map[string]interface{}{
		"type":    "connected",
		"message": "WebSocket connection established",
	}); err != nil {
		log.Printf("Failed to send initial message: %v", err)
		return
	}

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines
	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		if err := c.conn.Close(); err != nil {
			log.Printf("Error closing connection: %v", err)
		}
	}()

	if err := c.conn.SetReadDeadline(time.Now().Add(60 * time.Second)); err != nil {
		log.Printf("Error setting read deadline: %v", err)
		return
	}
	c.conn.SetPongHandler(func(string) error {
		if err := c.conn.SetReadDeadline(time.Now().Add(60 * time.Second)); err != nil {
			log.Printf("Error setting read deadline: %v", err)
			return err
		}
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err,
				websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		if err := c.conn.Close(); err != nil {
			log.Printf("Error closing connection: %v", err)
		}
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !c.handleMessage(message, ok) {
				return
			}
		case <-ticker.C:
			if !c.handlePing() {
				return
			}
		}
	}
}

func (c *Client) handleMessage(message []byte, ok bool) bool {
	if err := c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second)); err != nil {
		log.Printf("Error setting write deadline: %v", err)
		return false
	}
	if !ok {
		if err := c.conn.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
			log.Printf("Error writing close message: %v", err)
		}
		return false
	}

	w, err := c.conn.NextWriter(websocket.TextMessage)
	if err != nil {
		return false
	}
	if _, err := w.Write(message); err != nil {
		log.Printf("Error writing message: %v", err)
		return false
	}

	n := len(c.send)
	for i := 0; i < n; i++ {
		if _, err := w.Write([]byte{'\n'}); err != nil {
			log.Printf("Error writing newline: %v", err)
			return false
		}
		if _, err := w.Write(<-c.send); err != nil {
			log.Printf("Error writing queued message: %v", err)
			return false
		}
	}

	if err := w.Close(); err != nil {
		return false
	}
	return true
}

func (c *Client) handlePing() bool {
	if err := c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second)); err != nil {
		log.Printf("Error setting write deadline: %v", err)
		return false
	}
	if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
		return false
	}
	return true
}

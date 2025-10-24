package api

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var hub *WebSocketHub

func init() {
	hub = NewWebSocketHub()
	go hub.Run()
}

// SetupRoutes configures API routes
func SetupRoutes(router *gin.Engine, proc interface{}, logger *zap.Logger) {
	// Routes will be configured here later
	api := router.Group("/api/v1")

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Lineage endpoints
	lineage := api.Group("/lineage")
	{
		lineage.GET("/graph", getLineageGraph)
		lineage.GET("/nodes", getNodes)
		lineage.GET("/nodes/:id", getNodeDetails)
		lineage.GET("/edges", getEdges)
		lineage.GET("/search", searchLineage)
	}

	// WebSocket endpoint
	router.GET("/ws/lineage", HandleWebSocket)

	// Serve static files
	router.StaticFile("/", "./ui/dist/index.html")
	router.Static("/static", "./ui/dist/static")
}

func getLineageGraph(c *gin.Context) {
	// TODO: Query graph database for full lineage graph
	c.JSON(200, gin.H{
		"nodes": []interface{}{
			map[string]interface{}{
				"id":    "table1",
				"label": "users",
				"type":  "table",
			},
			map[string]interface{}{
				"id":    "table2",
				"label": "orders",
				"type":  "table",
			},
			map[string]interface{}{
				"id":    "job1",
				"label": "Process Orders",
				"type":  "transformation",
			},
		},
		"edges": []interface{}{
			map[string]interface{}{
				"id":     "edge1",
				"source": "table1",
				"target": "job1",
				"type":   "reads",
			},
			map[string]interface{}{
				"id":     "edge2",
				"source": "table2",
				"target": "job1",
				"type":   "reads",
			},
		},
	})
}

func getNodes(c *gin.Context) {
	// TODO: Query graph database for nodes
	c.JSON(200, gin.H{"nodes": []interface{}{}})
}

func getEdges(c *gin.Context) {
	// TODO: Query graph database for edges
	c.JSON(200, gin.H{"edges": []interface{}{}})
}

func searchLineage(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(400, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	// TODO: Implement search logic
	c.JSON(200, gin.H{
		"nodes":      []interface{}{},
		"edges":      []interface{}{},
		"totalNodes": 0,
		"totalEdges": 0,
	})
}

func getNodeDetails(c *gin.Context) {
	nodeID := c.Param("id")

	// TODO: Query graph database for node details
	c.JSON(200, gin.H{
		"id":    nodeID,
		"label": "Sample Node",
		"type":  "table",
		"metadata": map[string]interface{}{
			"description": "Sample node metadata",
		},
	})
}

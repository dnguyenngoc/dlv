package api

import (
	"github.com/dnguyenngoc/dlv/internal/processor"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// SetupRoutes configures API routes
func SetupRoutes(router *gin.Engine, proc processor.Processor, logger *zap.Logger) {
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
		lineage.GET("/edges", getEdges)
		lineage.GET("/search", searchLineage)
	}

	// Serve static files
	router.StaticFile("/", "./ui/dist/index.html")
	router.Static("/static", "./ui/dist/static")
}

func getLineageGraph(c *gin.Context) {
	c.JSON(200, gin.H{"message": "get lineage graph"})
}

func getNodes(c *gin.Context) {
	c.JSON(200, gin.H{"nodes": []interface{}{}})
}

func getEdges(c *gin.Context) {
	c.JSON(200, gin.H{"edges": []interface{}{}})
}

func searchLineage(c *gin.Context) {
	c.JSON(200, gin.H{"results": []interface{}{}})
}


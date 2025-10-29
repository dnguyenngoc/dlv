package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/dnguyenngoc/dlv/pkg/models"
	"github.com/dnguyenngoc/dlv/pkg/services"

	"github.com/gin-gonic/gin"
)

type SourceHandler struct {
	sourceService *services.SourceService
}

func NewSourceHandler(sourceService *services.SourceService) *SourceHandler {
	return &SourceHandler{
		sourceService: sourceService,
	}
}

// CreateSource creates a new data source
// @Summary Create a new data source
// @Description Create a new data source with connection details
// @Tags sources
// @Accept json
// @Produce json
// @Param source body models.DataSourceCreateRequest true "Data source details"
// @Success 201 {object} models.DataSource
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/sources [post]
func (h *SourceHandler) CreateSource(c *gin.Context) {
	var req models.DataSourceCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	source, err := h.sourceService.CreateSource(&req, userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, source)
}

// GetSources retrieves all data sources for the authenticated user
// @Summary Get all data sources
// @Description Get all data sources for the authenticated user
// @Tags sources
// @Produce json
// @Success 200 {array} models.DataSource
// @Failure 500 {object} map[string]string
// @Router /api/v1/sources [get]
func (h *SourceHandler) GetSources(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	sources, err := h.sourceService.GetSources(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, sources)
}

// GetSource retrieves a specific data source by ID
// @Summary Get a data source by ID
// @Description Get a specific data source by ID for the authenticated user
// @Tags sources
// @Produce json
// @Param id path int true "Data source ID"
// @Success 200 {object} models.DataSource
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/sources/{id} [get]
func (h *SourceHandler) GetSource(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source ID"})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	source, err := h.sourceService.GetSource(uint(id), userID.(uint))
	if err != nil {
		if err.Error() == "data source not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, source)
}

// UpdateSource updates a data source
// @Summary Update a data source
// @Description Update a data source by ID for the authenticated user
// @Tags sources
// @Accept json
// @Produce json
// @Param id path int true "Data source ID"
// @Param source body models.DataSourceUpdateRequest true "Updated data source details"
// @Success 200 {object} models.DataSource
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/sources/{id} [put]
func (h *SourceHandler) UpdateSource(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source ID"})
		return
	}

	var req models.DataSourceUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	source, err := h.sourceService.UpdateSource(uint(id), &req, userID.(uint))
	if err != nil {
		if err.Error() == "data source not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, source)
}

// DeleteSource deletes a data source
// @Summary Delete a data source
// @Description Delete a data source by ID for the authenticated user
// @Tags sources
// @Param id path int true "Data source ID"
// @Success 204 "No Content"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/sources/{id} [delete]
func (h *SourceHandler) DeleteSource(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source ID"})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	err = h.sourceService.DeleteSource(uint(id), userID.(uint))
	if err != nil {
		if err.Error() == "data source not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// TestConnection tests the connection to a data source
// @Summary Test data source connection
// @Description Test the connection to a data source
// @Tags sources
// @Accept json
// @Produce json
// @Param test body models.DataSourceTestRequest true "Connection test details"
// @Success 200 {object} models.DataSourceTest
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/sources/test [post]
func (h *SourceHandler) TestConnection(c *gin.Context) {
	var req models.DataSourceTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.sourceService.TestConnection(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// AnalyzeDatabase godoc
// @Summary Analyze database structure
// @Description Analyze a database source and return statistics about tables, schemas, etc.
// @Tags sources
// @Produce json
// @Param id path int true "Data Source ID"
// @Success 200 {object} models.DatabaseAnalysis
// @Failure 400 {object} gin.H{"error": "Bad Request"}
// @Failure 404 {object} gin.H{"error": "Not Found"}
// @Failure 500 {object} gin.H{"error": "Internal Server Error"}
// @Security ApiKeyAuth
// @Router /sources/{id}/analyze [post]
func (h *SourceHandler) AnalyzeDatabase(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	analysis, err := h.sourceService.AnalyzeDatabase(
		c.Request.Context(),
		uint(id),
		userID.(uint),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to analyze database: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, analysis)
}

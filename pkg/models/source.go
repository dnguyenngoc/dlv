package models

import (
	"time"
)

// DataSource represents a data source configuration
type DataSource struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	Name             string     `json:"name" gorm:"not null;uniqueIndex:idx_user_name"`
	Type             string     `json:"type" gorm:"not null"` // spark, kafka, airflow, database, custom
	ConnectionString string     `json:"connection_string" gorm:"not null"`
	Username         string     `json:"username"`
	Password         string     `json:"password" gorm:"type:text"`
	Description      string     `json:"description"`
	Status           string     `json:"status" gorm:"default:'disconnected'"` // connected, disconnected, error
	LastSync         *time.Time `json:"last_sync"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	CreatedBy        uint       `json:"created_by" gorm:"uniqueIndex:idx_user_name"`
}

// DataSourceTest represents a connection test result
type DataSourceTest struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Latency int64  `json:"latency_ms"`
}

// DataSourceCreateRequest represents the request to create a data source
type DataSourceCreateRequest struct {
	Name             string `json:"name" binding:"required"`
	Type             string `json:"type" binding:"required,oneof=spark kafka airflow database custom"`
	ConnectionString string `json:"connection_string" binding:"required"`
	Username         string `json:"username"`
	Password         string `json:"password"`
	Description      string `json:"description"`
}

// DataSourceUpdateRequest represents the request to update a data source
type DataSourceUpdateRequest struct {
	Name             *string    `json:"name,omitempty"`
	Type             *string    `json:"type,omitempty"`
	ConnectionString *string    `json:"connection_string,omitempty"`
	Username         *string    `json:"username,omitempty"`
	Password         *string    `json:"password,omitempty"`
	Description      *string    `json:"description,omitempty"`
	Status           *string    `json:"status,omitempty"`
	LastSync         *time.Time `json:"last_sync,omitempty"`
}

// DataSourceTestRequest represents the request to test a data source connection
type DataSourceTestRequest struct {
	ConnectionString string `json:"connection_string" binding:"required,min=1"`
	Username         string `json:"username"`
	Password         string `json:"password"`
	Type             string `json:"type" binding:"required,oneof=spark kafka airflow database custom"`
}

// DataSourceTestResponse represents the response body for a data source connection test
type DataSourceTestResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Latency int64  `json:"latency_ms"`
}

// TableInfo represents information about a database table
type TableInfo struct {
	Name string `json:"name"`
	Size string `json:"size"`
}

// DatabaseAnalysis represents the analysis results of a database
type DatabaseAnalysis struct {
	SourceID     uint        `json:"source_id"`
	SourceName   string      `json:"source_name"`
	Type         string      `json:"type"`
	Status       string      `json:"status"`
	DatabaseName string      `json:"database_name"`
	TotalTables  int         `json:"total_tables"`
	TotalSchemas int         `json:"total_schemas"`
	TotalViews   int         `json:"total_views"`
	TopTables    []TableInfo `json:"top_tables"`
	AnalyzedAt   time.Time   `json:"analyzed_at"`
}

package services

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/dnguyenngoc/dlv/pkg/models"

	"gorm.io/gorm"
)

type SourceService struct {
	db *gorm.DB
}

func NewSourceService(db *gorm.DB) *SourceService {
	return &SourceService{db: db}
}

// CreateSource creates a new data source
func (s *SourceService) CreateSource(
	req *models.DataSourceCreateRequest,
	userID uint,
) (*models.DataSource, error) {
	// Check for duplicate source names for this user
	var existingSource models.DataSource
	err := s.db.Where("name = ? AND created_by = ?", req.Name, userID).
		First(&existingSource).Error
	if err == nil {
		return nil, fmt.Errorf("a source with the name '%s' already exists", req.Name)
	} else if err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("failed to check for duplicate source name: %w", err)
	}

	source := &models.DataSource{
		Name:             req.Name,
		Type:             req.Type,
		ConnectionString: req.ConnectionString,
		Username:         req.Username,
		Password:         req.Password,
		Description:      req.Description,
		Status:           "disconnected",
		CreatedBy:        userID,
	}

	if err := s.db.Create(source).Error; err != nil {
		return nil, fmt.Errorf("failed to create data source: %w", err)
	}

	return source, nil
}

// GetSources retrieves all data sources for a user
func (s *SourceService) GetSources(userID uint) ([]models.DataSource, error) {
	var sources []models.DataSource
	if err := s.db.Where("created_by = ?", userID).Find(&sources).Error; err != nil {
		return nil, fmt.Errorf("failed to get data sources: %w", err)
	}
	return sources, nil
}

// GetSource retrieves a specific data source by ID
func (s *SourceService) GetSource(id uint, userID uint) (*models.DataSource, error) {
	var source models.DataSource
	err := s.db.Where("id = ? AND created_by = ?", id, userID).
		First(&source).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("data source not found")
		}
		return nil, fmt.Errorf("failed to get data source: %w", err)
	}
	return &source, nil
}

// UpdateSource updates a data source
func (s *SourceService) UpdateSource(
	id uint,
	req *models.DataSourceUpdateRequest,
	userID uint,
) (*models.DataSource, error) {
	var source models.DataSource
	err := s.db.Where("id = ? AND created_by = ?", id, userID).
		First(&source).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("data source not found")
		}
		return nil, fmt.Errorf("failed to get data source: %w", err)
	}

	// Check for duplicate source names if name is being updated
	if req.Name != nil && *req.Name != source.Name {
		var existingSource models.DataSource
		err := s.db.Where("name = ? AND created_by = ? AND id != ?", *req.Name, userID, id).
			First(&existingSource).Error
		if err == nil {
			return nil, fmt.Errorf("a source with the name '%s' already exists", *req.Name)
		} else if err != gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("failed to check for duplicate source name: %w", err)
		}
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Type != nil {
		updates["type"] = *req.Type
	}
	if req.ConnectionString != nil {
		updates["connection_string"] = *req.ConnectionString
	}
	if req.Username != nil {
		updates["username"] = *req.Username
	}
	if req.Password != nil {
		updates["password"] = *req.Password
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.LastSync != nil {
		updates["last_sync"] = *req.LastSync
	}

	updates["updated_at"] = time.Now()

	if err := s.db.Model(&source).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update data source: %w", err)
	}

	return &source, nil
}

// DeleteSource deletes a data source
func (s *SourceService) DeleteSource(id uint, userID uint) error {
	result := s.db.Where("id = ? AND created_by = ?", id, userID).
		Delete(&models.DataSource{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete data source: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("data source not found")
	}
	return nil
}

// TestConnection tests the connection to a data source
func (s *SourceService) TestConnection(
	req *models.DataSourceTestRequest,
) (*models.DataSourceTest, error) {
	start := time.Now()

	// Mock connection testing based on type
	var success bool
	var message string

	switch req.Type {
	case "database":
		success, message = s.testDatabaseConnection(req)
	case "kafka":
		success, message = s.testKafkaConnection(req)
	case "spark":
		success, message = s.testSparkConnection(req)
	case "airflow":
		success, message = s.testAirflowConnection(req)
	case "custom":
		success, message = s.testCustomConnection(req)
	default:
		return nil, fmt.Errorf("unsupported data source type: %s", req.Type)
	}

	latency := time.Since(start).Milliseconds()

	return &models.DataSourceTest{
		Success: success,
		Message: message,
		Latency: latency,
	}, nil
}

// testDatabaseConnection tests database connection
func (s *SourceService) testDatabaseConnection(
	req *models.DataSourceTestRequest,
) (bool, string) {
	// Basic validation
	if req.ConnectionString == "" {
		return false, "Connection string is required"
	}
	if req.Username == "" {
		return false, "Username is required for database connection"
	}
	if req.Password == "" {
		return false, "Password is required for database connection"
	}

	// Modify connection string to disable SSL
	connectionString := req.ConnectionString
	if !contains(connectionString, "sslmode=") {
		if contains(connectionString, "?") {
			connectionString += "&sslmode=disable"
		} else {
			connectionString += "?sslmode=disable"
		}
	}

	// Try to connect to database
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return false, fmt.Sprintf("Failed to open connection: %v", err)
	}
	defer func() {
		if closeErr := db.Close(); closeErr != nil {
			// Log error but don't fail the function
			_ = closeErr
		}
	}()

	// Test connection with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}

	return true, "Database connection successful"
}

// testKafkaConnection tests Kafka connection
func (s *SourceService) testKafkaConnection(
	req *models.DataSourceTestRequest,
) (bool, string) {
	// Basic validation
	if req.ConnectionString == "" {
		return false, "Kafka broker address is required"
	}

	// Mock Kafka connection test
	// In real implementation, you would use a Kafka client
	if len(req.ConnectionString) < 10 {
		return false, "Invalid Kafka broker address format"
	}

	return true, "Kafka connection successful"
}

// testSparkConnection tests Spark connection
func (s *SourceService) testSparkConnection(
	req *models.DataSourceTestRequest,
) (bool, string) {
	// Basic validation
	if req.ConnectionString == "" {
		return false, "Spark master URL is required"
	}

	// Mock Spark connection test
	// In real implementation, you would use Spark client
	if !contains(req.ConnectionString, "spark://") &&
		!contains(req.ConnectionString, "yarn://") {
		return false, "Invalid Spark master URL format"
	}

	return true, "Spark connection successful"
}

// testAirflowConnection tests Airflow connection
func (s *SourceService) testAirflowConnection(
	req *models.DataSourceTestRequest,
) (bool, string) {
	// Basic validation
	if req.ConnectionString == "" {
		return false, "Airflow API URL is required"
	}

	// Mock Airflow connection test
	// In real implementation, you would use Airflow API client
	if !contains(req.ConnectionString, "http://") &&
		!contains(req.ConnectionString, "https://") {
		return false, "Invalid Airflow API URL format"
	}

	return true, "Airflow connection successful"
}

// testCustomConnection tests custom connection
func (s *SourceService) testCustomConnection(
	req *models.DataSourceTestRequest,
) (bool, string) {
	// Basic validation
	if req.ConnectionString == "" {
		return false, "Connection string is required"
	}

	// Mock custom connection test
	// In real implementation, you would implement custom logic
	if len(req.ConnectionString) < 5 {
		return false, "Connection string too short"
	}

	return true, "Custom connection successful"
}

// Helper function to check if string contains substring
func contains(s, substr string) bool {
	return len(s) >= len(substr) && s[:len(substr)] == substr
}

// AnalyzeDatabase analyzes a database and returns statistics
func (s *SourceService) AnalyzeDatabase(
	ctx context.Context,
	sourceID uint,
	userID uint,
) (*models.DatabaseAnalysis, error) {
	// Get source
	source, err := s.GetSource(sourceID, userID)
	if err != nil {
		return nil, err
	}

	if source.Type != "database" {
		return nil, fmt.Errorf("source is not a database")
	}

	// Modify connection string to disable SSL
	connectionString := source.ConnectionString
	if !contains(connectionString, "sslmode=") {
		if contains(connectionString, "?") {
			connectionString += "&sslmode=disable"
		} else {
			connectionString += "?sslmode=disable"
		}
	}

	// Connect to database
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}
	defer func() {
		if closeErr := db.Close(); closeErr != nil {
			// Log error but don't fail the function
			_ = closeErr
		}
	}()

	// Test connection
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("database connection failed: %v", err)
	}

	analysis := &models.DatabaseAnalysis{
		SourceID:   sourceID,
		SourceName: source.Name,
		Type:       source.Type,
		Status:     "connected",
		AnalyzedAt: time.Now(),
	}

	// Get database name
	var dbName string
	err = db.QueryRowContext(ctx, "SELECT current_database()").Scan(&dbName)
	if err == nil {
		analysis.DatabaseName = dbName
	}

	// Get total tables count
	var tableCount int
	if err := db.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM information_schema.tables
		WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
	`).Scan(&tableCount); err == nil {
		analysis.TotalTables = tableCount
	}

	// Get total schemas count
	var schemaCount int
	if err := db.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM information_schema.schemata
		WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
	`).Scan(&schemaCount); err == nil {
		analysis.TotalSchemas = schemaCount
	}

	// Get total views count
	var viewCount int
	if err := db.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM information_schema.views
		WHERE table_schema = 'public'
	`).Scan(&viewCount); err == nil {
		analysis.TotalViews = viewCount
	}

	// Get table sizes
	rows, err := db.QueryContext(ctx, `
		SELECT
			table_name,
			pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
		FROM information_schema.tables
		WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
		ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC
		LIMIT 10
	`)
	if err == nil {
		defer func() {
			if closeErr := rows.Close(); closeErr != nil {
				// Log error but don't fail the function
				_ = closeErr
			}
		}()
		for rows.Next() {
			var tableName, size string
			if err := rows.Scan(&tableName, &size); err == nil {
				analysis.TopTables = append(analysis.TopTables, models.TableInfo{
					Name: tableName,
					Size: size,
				})
			}
		}
	}

	// Update last sync time
	now := time.Now()
	source.LastSync = &now
	source.Status = "connected"

	// Update source status
	status := "connected"
	updateReq := &models.DataSourceUpdateRequest{
		Status:   &status,
		LastSync: &now,
	}
	_, updateErr := s.UpdateSource(sourceID, updateReq, userID)
	if updateErr != nil {
		// Log error but don't fail the function
		_ = updateErr
	}

	return analysis, nil
}

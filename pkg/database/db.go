package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver
	"go.uber.org/zap"
)

// DB wraps sql.DB with logger
type DB struct {
	*sql.DB
	logger *zap.Logger
}

// Config holds database configuration
type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// NewPostgres creates a new PostgreSQL database connection
func NewPostgres(config Config, logger *zap.Logger) (*DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	logger.Info("Database connection established",
		zap.String("host", config.Host),
		zap.Int("port", config.Port),
		zap.String("database", config.DBName),
	)

	return &DB{DB: db, logger: logger}, nil
}

// RunMigrations runs database migrations
func (db *DB) RunMigrations(migrations []string) error {
	for i, migration := range migrations {
		db.logger.Info("Running migration", zap.Int("number", i+1))
		if _, err := db.Exec(migration); err != nil {
			return fmt.Errorf("migration %d failed: %w", i+1, err)
		}
	}
	db.logger.Info("All migrations completed successfully")
	return nil
}

// Close closes the database connection
func (db *DB) Close() error {
	db.logger.Info("Closing database connection")
	return db.DB.Close()
}

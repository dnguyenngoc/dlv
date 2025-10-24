package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/dnguyenngoc/dlv/internal/api"
	"github.com/dnguyenngoc/dlv/internal/auth"
	"github.com/dnguyenngoc/dlv/internal/repository"
	"github.com/dnguyenngoc/dlv/pkg/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

var (
	version = "dev"
	commit  = "unknown"
	date    = "unknown"
)

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

var rootCmd = &cobra.Command{
	Use:   "dlv",
	Short: "Data Lineage Visualizer - Real-time data lineage tracking",
	Long:  "DLV provides real-time data lineage tracking and visualization for big data pipelines",
	Run:   runServer,
}

var (
	port         int
	dbHost       string
	dbPort       int
	dbUser       string
	dbPassword   string
	dbName       string
	secretKey    string
	logLevel     string
)

func init() {
	rootCmd.Flags().IntVarP(&port, "port", "p", 8080, "Server port")
	rootCmd.Flags().StringVar(&dbHost, "db-host", "localhost", "Database host")
	rootCmd.Flags().IntVar(&dbPort, "db-port", 5432, "Database port")
	rootCmd.Flags().StringVar(&dbUser, "db-user", "postgres", "Database username")
	rootCmd.Flags().StringVar(&dbPassword, "db-password", "postgres", "Database password")
	rootCmd.Flags().StringVar(&dbName, "db-name", "dlv", "Database name")
	rootCmd.Flags().StringVar(&secretKey, "secret-key", "", "JWT secret key")
	rootCmd.Flags().StringVar(&logLevel, "log-level", "info", "Log level (debug, info, warn, error)")
}

func runServer(cmd *cobra.Command, args []string) {
	// Initialize logger
	logger := initLogger(logLevel)
	defer func() {
		_ = logger.Sync()
	}()

	logger.Info("Starting DLV server",
		zap.String("version", version),
		zap.String("commit", commit),
		zap.String("date", date),
	)

	// Initialize database
	dbConfig := database.Config{
		Host:     dbHost,
		Port:     dbPort,
		User:     dbUser,
		Password: dbPassword,
		DBName:   dbName,
		SSLMode:  "disable",
	}

	db, err := database.NewPostgres(dbConfig, logger)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer func() {
		_ = db.Close()
	}()

	// Initialize auth service
	authService := auth.NewAuthService(secretKey)

	// Initialize repositories
	userRepo := repository.NewUserRepository(db.DB, logger)

	// Initialize API server
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin", "Cache-Control", "X-Requested-With"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	// Setup auth routes
	api.SetupAuthRoutes(router, authService, userRepo, logger)

	// Setup other routes (lineage, etc.)
	api.SetupRoutes(router, nil, logger)

	// Start HTTP server
	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", port),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	logger.Info("Server started", zap.Int("port", port))

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited")
}

func initLogger(level string) *zap.Logger {
	var config zap.Config
	if level == "debug" {
		config = zap.NewDevelopmentConfig()
	} else {
		config = zap.NewProductionConfig()
	}

	logger, err := config.Build()
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize logger: %v", err))
	}

	return logger
}

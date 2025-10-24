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
	"github.com/dnguyenngoc/dlv/internal/collector"
	"github.com/dnguyenngoc/dlv/internal/processor"
	"github.com/dnguyenngoc/dlv/pkg/graph"
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
	graphDBURL   string
	graphDBUser  string
	graphDBPass  string
	logLevel     string
	sparkEnabled bool
	sparkURL     string
)

func init() {
	rootCmd.Flags().IntVarP(&port, "port", "p", 8080, "Server port")
	rootCmd.Flags().StringVar(&graphDBURL, "graphdb-url", "bolt://neo4j:7687", "Graph database URL")
	rootCmd.Flags().StringVar(&graphDBUser, "graphdb-user", "neo4j", "Graph database username")
	rootCmd.Flags().StringVar(&graphDBPass, "graphdb-pass", "", "Graph database password")
	rootCmd.Flags().StringVar(&logLevel, "log-level", "info", "Log level (debug, info, warn, error)")
	rootCmd.Flags().BoolVar(&sparkEnabled, "spark-enabled", false, "Enable Spark collector")
	rootCmd.Flags().StringVar(&sparkURL, "spark-url", "http://spark-history:18080", "Spark History Server URL")
}

func runServer(cmd *cobra.Command, args []string) {
	// Initialize logger
	logger := initLogger(logLevel)
	defer logger.Sync()

	logger.Info("Starting DLV server",
		zap.String("version", version),
		zap.String("commit", commit),
		zap.String("date", date),
	)

	// Initialize graph database
	graphDB, err := graph.NewNeo4jClient(graphDBURL, graphDBUser, graphDBPass)
	if err != nil {
		logger.Fatal("Failed to connect to graph database", zap.Error(err))
	}
	defer graphDB.Close()

	// Initialize collectors
	collectors := make([]collector.Collector, 0)
	if sparkEnabled {
		sparkCollector := collector.NewSparkCollector(sparkURL, logger)
		collectors = append(collectors, sparkCollector)
		logger.Info("Spark collector enabled", zap.String("url", sparkURL))
	}

	// Initialize processor
	proc := processor.NewLineageProcessor(graphDB, logger)
	go proc.Start(context.Background())

	// Start collectors
	for _, c := range collectors {
		go c.Start(context.Background(), proc)
	}

	// Initialize API server
	router := gin.Default()
	api.SetupRoutes(router, proc, logger)

	// Start HTTP server
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: router,
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


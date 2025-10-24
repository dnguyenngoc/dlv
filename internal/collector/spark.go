package collector

import (
	"context"
	"fmt"
	"time"

	"github.com/dnguyenngoc/dlv/internal/processor"
	"go.uber.org/zap"
)

type SparkCollector struct {
	*BaseCollector
	historyServerURL string
}

func NewSparkCollector(historyServerURL string, logger *zap.Logger) *SparkCollector {
	return &SparkCollector{
		BaseCollector:   NewBaseCollector("spark", logger),
		historyServerURL: historyServerURL,
	}
}

func (s *SparkCollector) Start(ctx context.Context, proc processor.Processor) {
	s.logger.Info("Starting Spark collector", zap.String("url", s.historyServerURL))

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			s.logger.Info("Spark collector stopped")
			return
		case <-ticker.C:
			if err := s.collect(ctx, proc); err != nil {
				s.logger.Error("Failed to collect Spark lineage", zap.Error(err))
			}
		}
	}
}

func (s *SparkCollector) collect(ctx context.Context, proc processor.Processor) error {
	// TODO: Implement Spark lineage collection
	// This would connect to Spark History Server API and extract lineage
	s.logger.Debug("Collecting Spark lineage", zap.String("url", s.historyServerURL))
	return nil
}

func (s *SparkCollector) Stop() error {
	s.logger.Info("Stopping Spark collector")
	return nil
}


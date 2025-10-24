package collector

import (
	"context"

	"github.com/dnguyenngoc/dlv/internal/processor"
	"go.uber.org/zap"
)

// Collector defines the interface for lineage collectors
type Collector interface {
	// Start begins collecting lineage data
	Start(ctx context.Context, processor processor.Processor)

	// Stop stops the collector
	Stop() error

	// Name returns the collector name
	Name() string
}

// BaseCollector provides base functionality for collectors
type BaseCollector struct {
	name   string
	logger *zap.Logger
}

func NewBaseCollector(name string, logger *zap.Logger) *BaseCollector {
	return &BaseCollector{
		name:   name,
		logger: logger,
	}
}

func (b *BaseCollector) Name() string {
	return b.name
}


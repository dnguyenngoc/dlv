package api

import (
	"github.com/dnguyenngoc/dlv/internal/auth"
	"github.com/dnguyenngoc/dlv/internal/middleware"
	"github.com/dnguyenngoc/dlv/internal/repository"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// SetupAuthRoutes configures authentication routes
func SetupAuthRoutes(router *gin.Engine, authService *auth.AuthService, userRepo *repository.UserRepository, logger *zap.Logger) {
	authHandlers := NewAuthHandlers(authService, userRepo, logger)

	// Public auth routes
	auth := router.Group("/api/v1/auth")
	{
		auth.POST("/login", authHandlers.Login)
		auth.POST("/register", authHandlers.Register)
	}

	// Protected auth routes
	protected := router.Group("/api/v1/auth")
	protected.Use(middleware.AuthMiddleware(authService, logger))
	{
		protected.GET("/me", authHandlers.GetMe)
		protected.POST("/logout", authHandlers.Logout)
	}
}

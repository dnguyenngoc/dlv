package api

import (
	"net/http"

	"github.com/dnguyenngoc/dlv/internal/auth"
	"github.com/dnguyenngoc/dlv/internal/repository"
	"github.com/dnguyenngoc/dlv/pkg/models"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// AuthHandlers handles authentication endpoints
type AuthHandlers struct {
	authService *auth.Service
	userRepo    *repository.UserRepository
	logger      *zap.Logger
}

// NewAuthHandlers creates new auth handlers
func NewAuthHandlers(authService *auth.Service, userRepo *repository.UserRepository,
	logger *zap.Logger) *AuthHandlers {
	return &AuthHandlers{
		authService: authService,
		userRepo:    userRepo,
		logger:      logger,
	}
}

// Login handles user login
func (h *AuthHandlers) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest,
			gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Get user by username
	user, err := h.userRepo.GetUserByUsername(req.Username)
	if err != nil {
		h.logger.Warn("Login attempt failed - user not found",
			zap.String("username", req.Username))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Verify password
	if !h.authService.VerifyPassword(req.Password, user.PasswordHash) {
		h.logger.Warn("Login attempt failed - invalid password",
			zap.String("username", req.Username))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		h.logger.Error("Failed to generate token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	h.logger.Info("User logged in successfully", zap.String("username", user.Username))

	c.JSON(http.StatusOK, models.LoginResponse{
		Token:     token,
		User:      user.ToPublic(),
		ExpiresIn: int(auth.TokenExpiration.Seconds()),
	})
}

// Register handles user registration
func (h *AuthHandlers) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest,
			gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Check if user exists
	exists, err := h.userRepo.UserExists(req.Username, req.Email)
	if err != nil {
		h.logger.Error("Failed to check user existence", zap.Error(err))
		c.JSON(http.StatusInternalServerError,
			gin.H{"error": "Failed to check user existence"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Hash password
	passwordHash, err := h.authService.HashPassword(req.Password)
	if err != nil {
		h.logger.Error("Failed to hash password", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	user := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: passwordHash,
		Role:         "user", // Default role
	}

	if err := h.userRepo.CreateUser(user); err != nil {
		h.logger.Error("Failed to create user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	h.logger.Info("User registered successfully", zap.String("username", user.Username))

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    user.ToPublic(),
	})
}

// GetMe returns current user information
func (h *AuthHandlers) GetMe(c *gin.Context) {
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID, err := h.authService.GetUserIDFromToken(claims.(auth.MapClaims))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	user, err := h.userRepo.GetUserByID(userID)
	if err != nil {
		h.logger.Error("Failed to get user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		return
	}

	c.JSON(http.StatusOK, user.ToPublic())
}

// Logout handles user logout
func (h *AuthHandlers) Logout(c *gin.Context) {
	// TODO: Implement token blacklisting or session management
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

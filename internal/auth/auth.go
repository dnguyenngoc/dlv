package auth

import (
	"errors"
	"time"

	"github.com/dnguyenngoc/dlv/pkg/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// MapClaims is an alias for jwt.MapClaims
type MapClaims = jwt.MapClaims

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserExists         = errors.New("user already exists")
	ErrTokenExpired       = errors.New("token expired")
	ErrInvalidToken       = errors.New("invalid token")
)

const (
	TokenExpiration = 24 * time.Hour
)

// DefaultSecretKey is the default secret key (should be changed in production)
// #nosec G101 -- This is just a default placeholder
var DefaultSecretKey = "dlv-secret-key-change-in-production"

// AuthService handles authentication logic
type AuthService struct {
	secretKey []byte
}

// NewAuthService creates a new auth service
func NewAuthService(secretKey string) *AuthService {
	if secretKey == "" {
		secretKey = DefaultSecretKey
	}
	return &AuthService{
		secretKey: []byte(secretKey),
	}
}

// HashPassword hashes a password using bcrypt
func (s *AuthService) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// VerifyPassword verifies a password against a hash
func (s *AuthService) VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken generates a JWT token for a user
func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(TokenExpiration).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}

// ValidateToken validates a JWT token and returns the claims
func (s *AuthService) ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return s.secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check expiration
		if exp, ok := claims["exp"].(float64); ok {
			if time.Now().Unix() > int64(exp) {
				return nil, ErrTokenExpired
			}
		}
		return claims, nil
	}

	return nil, ErrInvalidToken
}

// GetUserIDFromToken extracts user ID from token claims
func (s *AuthService) GetUserIDFromToken(claims jwt.MapClaims) (int, error) {
	userID, ok := claims["user_id"].(float64)
	if !ok {
		return 0, ErrInvalidToken
	}
	return int(userID), nil
}

// GetUserRoleFromToken extracts user role from token claims
func (s *AuthService) GetUserRoleFromToken(claims jwt.MapClaims) (string, error) {
	role, ok := claims["role"].(string)
	if !ok {
		return "", ErrInvalidToken
	}
	return role, nil
}

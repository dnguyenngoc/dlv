package repository

import (
	"database/sql"
	"fmt"

	"github.com/dnguyenngoc/dlv/pkg/models"
	"go.uber.org/zap"
)

// UserRepository handles user database operations
type UserRepository struct {
	db     *sql.DB
	logger *zap.Logger
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB, logger *zap.Logger) *UserRepository {
	return &UserRepository{
		db:     db,
		logger: logger,
	}
}

// CreateUser creates a new user
func (r *UserRepository) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (username, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	
	err := r.db.QueryRow(query, user.Username, user.Email, user.PasswordHash, user.Role).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		r.logger.Error("Failed to create user", zap.Error(err))
		return fmt.Errorf("failed to create user: %w", err)
	}
	
	return nil
}

// GetUserByID retrieves a user by ID
func (r *UserRepository) GetUserByID(id int) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE id = $1`
	
	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.Role, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		r.logger.Error("Failed to get user by ID", zap.Error(err))
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	return user, nil
}

// GetUserByUsername retrieves a user by username
func (r *UserRepository) GetUserByUsername(username string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE username = $1`
	
	err := r.db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.Role, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		r.logger.Error("Failed to get user by username", zap.Error(err))
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	return user, nil
}

// GetUserByEmail retrieves a user by email
func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1`
	
	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.Role, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		r.logger.Error("Failed to get user by email", zap.Error(err))
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	return user, nil
}

// UserExists checks if a user exists by username or email
func (r *UserRepository) UserExists(username, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2)`
	var exists bool
	
	err := r.db.QueryRow(query, username, email).Scan(&exists)
	if err != nil {
		r.logger.Error("Failed to check user existence", zap.Error(err))
		return false, fmt.Errorf("failed to check user existence: %w", err)
	}
	
	return exists, nil
}

// GetAllUsers retrieves all users
func (r *UserRepository) GetAllUsers() ([]*models.User, error) {
	query := `SELECT id, username, email, password_hash, role, created_at, updated_at FROM users ORDER BY created_at DESC`
	
	rows, err := r.db.Query(query)
	if err != nil {
		r.logger.Error("Failed to get all users", zap.Error(err))
		return nil, fmt.Errorf("failed to get users: %w", err)
	}
	defer func() {
		_ = rows.Close()
	}()
	
	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(
			&user.ID, &user.Username, &user.Email, &user.PasswordHash,
			&user.Role, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			r.logger.Error("Failed to scan user", zap.Error(err))
			continue
		}
		users = append(users, user)
	}
	
	return users, nil
}


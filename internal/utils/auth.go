package utils

import (
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/models"
	"AlgoBoostWebSite/internal/verifEmail"
	"strconv"

	"errors"
	"time"

	"github.com/google/uuid"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

// LOGIN
func LoginUser(db *database.Database, email, password string) (models.User, error) {
	user, err := db.GetUserByEmail(email)
	if err != nil {
		return models.User{}, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		zap.L().Error("wrong password")
		return models.User{}, errors.New("invalid email or password")
	}

	return user, nil

}

// REGISTRATION
func CheckMembersList(db *database.Database, email string) (models.Whitelist, error) {
	whitelist, err := db.IsEmailWhitelisted(email)
	if err != nil {
		zap.L().Error("Error checking whitelist:", zap.Error(err))
		return models.Whitelist{}, errors.New("failed to check whitelist")
	}
	if whitelist.Name == "" {
		zap.L().Error("Email not allowed:", zap.String("email", email))
		return models.Whitelist{}, errors.New("email not allowed")
	}
	return whitelist, nil
}

func RegisterUser(db *database.Database, entry models.RegistrationEntry, token string) (int, error) {
	newUser := models.User{
		Name:     entry.Name,
		Email:    entry.Email,
		Password: entry.Password,
		Role:     "student",
	}

	userID, err := db.AddUser(newUser.Name, newUser.Email, newUser.Password, newUser.Role)
	if err != nil {
		zap.L().Error("Error adding new user:", zap.Error(err))
		return 0, err
	}
	zap.L().Info("New user with ID :", zap.String("userId", strconv.Itoa(userID)))
	return userID, nil
}

func SendVerificationEmail(email, name, verificationLink string) error {
	zap.L().Info("Sending verification email to:", zap.String("email", email), zap.String("name", name), zap.String("link", verificationLink))
	if err := verifEmail.SendVerificationEmailBrevo(email, name, verificationLink); err != nil {
		zap.L().Error("failed to send verification email", zap.Error(err))
		return err
	}
	// verifEmail.SendVerificationEmailSendGrid(email, name, verificationLink)
	return nil
}

// RESET PASSWORD
func ResetPassword(db *database.Database, entry models.RegistrationEntry) error {
	user, err := db.GetUserByEmail(entry.Email)
	if err != nil || user.ID == 0 {
		zap.L().Error("Error getting user by email:", zap.Error(err))
		return errors.New("user not found")
	}

	err = db.UpdateUserPassword(user.ID, entry.Password)
	if err != nil {
		zap.L().Error("Error updating user password:", zap.Error(err))
		return errors.New("failed to update password")
	}

	return nil
}

func SendResetPasswordEmail(email, name, verificationLink string) error {
	zap.L().Info("Sending reset password email to:", zap.String("email", email), zap.String("name", name), zap.String("link", verificationLink))
	if err := verifEmail.SendResetPasswordEmailBrevo(email, name, verificationLink); err != nil {
		zap.L().Error("failed to send reset password email", zap.Error(err))
		return err
	}
	return nil
}

// OTHER
func GenerateVerificationToken(db *database.Database, email, password, name, role, tokenType string) (string, error) {
	token := uuid.New().String()
	expires := time.Now().Add(24 * time.Hour)

	err := db.AddVerificationEntry(email, password, name, role, token, tokenType, expires.Format(time.RFC3339))
	if err != nil {
		zap.L().Error("Error adding user token:", zap.Error(err))
		return "", errors.New("failed to generate verification entry")
	}

	return token, nil
}

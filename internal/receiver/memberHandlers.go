package receiver

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"AlgoBoostWebSite/internal/config"
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/models"
	"AlgoBoostWebSite/internal/utils"

	"github.com/go-chi/chi/v5"
	kafka "github.com/segmentio/kafka-go"
)

var kafkaWriter *kafka.Writer = kafka.NewWriter(kafka.WriterConfig{
	Brokers: config.KafkaBrokers,
	Topic:   config.KafkaTopic,
})

func RegistrationHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type regCreds struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		var credentials regCreds
		err := json.NewDecoder(r.Body).Decode(&credentials)
		if err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if credentials.Email == "" || credentials.Password == "" {
			http.Error(w, "email and password are required", http.StatusBadRequest)
			return
		}

		// Check if the email is already registered
		existingUser, err := db.GetUserByEmail(credentials.Email)
		if err != nil {
			zap.L().Error("Error checking existing user:", zap.Error(err))
			http.Error(w, "failed to check existing user", http.StatusInternalServerError)
			return
		}

		if existingUser.ID != 0 {
			http.Error(w, "email already registered", http.StatusConflict)
			return
		}

		// check members list
		whitelist, err := utils.CheckMembersList(db, credentials.Email)
		if err != nil {
			http.Error(w, "email not allowed", http.StatusForbidden)
			return
		}

		// hashing the password becauase we're professional
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(credentials.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "failed to hash password", http.StatusInternalServerError)
			return
		}

		password := string(hashedPassword)

		// email verification
		token, err := utils.GenerateVerificationToken(db, credentials.Email, password, whitelist.Name, whitelist.Role, "registration")
		if err != nil {
			zap.L().Error("error generating verification token:", zap.Error(err))
			http.Error(w, "failed to generate verification token", http.StatusInternalServerError)
			return
		}

		verificationLink := fmt.Sprintf("http://localhost:5173/verify?token=%s", token)

		err = utils.SendVerificationEmail(credentials.Email, whitelist.Name, verificationLink)
		if err != nil {
			zap.L().Error("error sending verification email:", zap.Error(err))
			http.Error(w, "failed to send verification email", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode("verification email sent to " + credentials.Email)

	}
}

func VerifyHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			http.Error(w, "token is required", http.StatusBadRequest)
			return
		}

		entry, err := db.GetValidRegistrationEntry(token)
		if err != nil {
			zap.L().Error("Error getting registration entry by token:", zap.Error(err))
			http.Error(w, "help invalid token", http.StatusUnauthorized)
			return
		}

		if entry.TokenType == "registration" {
			userID, err := utils.RegisterUser(db, entry, token)
			if err != nil {
				zap.L().Error("Error registering user:", zap.Error(err))
				http.Error(w, "failed to register user", http.StatusInternalServerError)
				return
			}

			// send automatic login request
			// to get JWT token ? manually for now
			jwt, err := utils.GenerateJWT(userID, entry.Role)
			if err != nil {
				http.Error(w, "failed to generate jwt", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"token": jwt,
			})
		} else {
			err = utils.ResetPassword(db, entry)
			if err != nil {
				zap.L().Error("Error resetting password:", zap.Error(err))
				http.Error(w, "failed to reset password", http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode("password reset successful, you can now login with your new password")
		}

		err = db.MarkTokenAsUsed(token)
		if err != nil {
			zap.L().Error("Error marking token as used:", zap.Error(err))
			http.Error(w, "failed to verify token", http.StatusInternalServerError)
			return
		}

		db.DeleteVerificationEntry(token)
	}

}

func RequestResetPasswordHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type resetRequest struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		var req resetRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if req.Email == "" || req.Password == "" {
			http.Error(w, "email and password are required", http.StatusBadRequest)
			return
		}

		user, err := db.GetUserByEmail(req.Email)
		if err != nil || user.ID == 0 {
			http.Error(w, "user not found", http.StatusNotFound)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "failed to hash password", http.StatusInternalServerError)
			return
		}

		password := string(hashedPassword)

		// Generate a password reset token
		token, err := utils.GenerateVerificationToken(db, req.Email, password, user.Name, user.Role, "password_reset")
		if err != nil {
			http.Error(w, "failed to generate token", http.StatusInternalServerError)
			return
		}

		verificationLink := fmt.Sprintf("http://localhost:5173/reset-password-success?token=%s", token)

		// Send the reset email
		err = utils.SendResetPasswordEmail(req.Email, user.Name, verificationLink)
		if err != nil {
			http.Error(w, "failed to send email", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode("password reset email sent to " + req.Email)
	}
}

func LoginHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type creds struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		var credentials creds
		err := json.NewDecoder(r.Body).Decode(&credentials)
		if err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if credentials.Email == "" || credentials.Password == "" {
			http.Error(w, "email and password are required", http.StatusBadRequest)
			return
		}

		user, err := utils.LoginUser(db, credentials.Email, credentials.Password)
		if err != nil {
			zap.L().Error("Login error:", zap.Error(err))
			http.Error(w, "failed to login", http.StatusInternalServerError)
			return
		}

		// generate JWT token
		token, err := utils.GenerateJWT(user.ID, user.Role)
		if err != nil {
			zap.L().Error("JWT generation error:", zap.Error(err))
			http.Error(w, "failed to generate token", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{
			"token": token,
		})
	}
}

func GetAllLessonsHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)

		lessons, err := db.GetAllLessonsWithTasks(userID)
		if err != nil {
			http.Error(w, "failed to fetch lessons", 500)
			return
		}

		json.NewEncoder(w).Encode(lessons)
	}
}

func GetTasksByLessonIdHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lessonID := chi.URLParam(r, "lessonID")
		if lessonID == "" {
			http.Error(w, "lesson ID is required", http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(lessonID)
		if err != nil {
			http.Error(w, "invalid lesson ID", http.StatusBadRequest)
			return
		}

		tasks, err := db.GetTasksByLessonIdHandler(id)
		if err != nil {
			http.Error(w, "failed to fetch tasks", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(tasks)
	}
}

func GetTasksDetailsHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		taskID := chi.URLParam(r, "taskID")
		fmt.Println("Requested URL:", r.URL.Path)
		fmt.Println("Task ID:", taskID)
		if taskID == "" {
			http.Error(w, "task ID is required", http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(taskID)
		if err != nil {
			http.Error(w, "invalid task ID", http.StatusBadRequest)
			return
		}

		task, err := db.GetTask(id)
		if err != nil {
			http.Error(w, "failed to fetch tasks", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(task)
	}

}

func SubmitHandler(w http.ResponseWriter, r *http.Request) {
	var req models.Solution
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// serialise as json to end to kafka
	// converts the request to a JSON-formatted byte slice
	value, err := json.Marshal(req)
	if err != nil {
		zap.L().Error("JSON marshal error:", zap.Error(err))
		http.Error(w, "failed to marshal request", http.StatusInternalServerError)
		return
	}

	// write the message to kafka
	err = kafkaWriter.WriteMessages(context.Background(), kafka.Message{
		Key:   []byte(r.Context().Value("userID").(string)),
		Value: value,
	})
	if err != nil {
		zap.L().Error("Kafka write error:", zap.Error(err))
		http.Error(w, "failed to submit code", http.StatusInternalServerError)
		return
	}

	zap.L().Info("code submitted to Kafka for task", zap.String("taskID", strconv.Itoa(req.TaskID)))
	w.Write([]byte(`{"status": "submitted"}`))
}

package receiver

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"strconv"

	"AlgoBoostWebSite/internal/auth"
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/models"
	"AlgoBoostWebSite/internal/verifEmail"
	"context"

	"AlgoBoostWebSite/internal/config"

	"github.com/go-chi/chi/v5"
	kafka "github.com/segmentio/kafka-go"
)

var kafkaWriter *kafka.Writer = kafka.NewWriter(kafka.WriterConfig{
	Brokers: config.KafkaBrokers,
	Topic:   config.KafkaTopic,
})

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

		user, err := LoginUser(db, credentials.Email, credentials.Password)
		if err != nil {
			zap.L().Error("Login error:", zap.Error(err))
			http.Error(w, "failed to login", http.StatusInternalServerError)
			return
		}

		// generate JWT token
		token, err := auth.GenerateJWT(user.ID)
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

func CheckMembersList(db *database.Database, email string) (string, error) {
	whitelist, err := db.IsEmailWhitelisted(email)
	if err != nil {
		zap.L().Error("Error checking whitelist:", zap.Error(err))
		return "", errors.New("failed to check whitelist")
	}
	if whitelist.Name == "" {
		zap.L().Error("Email not allowed:", zap.String("email", email))
		return "", errors.New("email not allowed")
	}
	return whitelist.Name, nil
}

func generateVerificationToken(db *database.Database, email, password, name string) (string, error) {
	token := uuid.New().String()
	expires := time.Now().Add(24 * time.Hour)

	err := db.AddRegistrationEntry(email, password, name, token, "verfication", expires.Format(time.RFC3339))
	if err != nil {
		zap.L().Error("Error adding user token:", zap.Error(err))
		return "", errors.New("failed to generate verification token")
	}

	return token, nil
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
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		// // create new user
		newUser := models.User{
			Name:     entry.Name,
			Email:    entry.Email,
			Password: entry.Password,
			Role:     "student",
		}

		userID, err := db.AddUser(newUser.Name, newUser.Email, newUser.Password, newUser.Role)
		if err != nil {
			zap.L().Error("Error adding new user:", zap.Error(err))
			http.Error(w, "failed to register user", http.StatusInternalServerError)
			return
		}
		zap.L().Error("New user with ID :", zap.String("userId", strconv.Itoa(userID)))

		err = db.MarkTokenAsUsed(token)
		if err != nil {
			zap.L().Error("Error marking token as used:", zap.Error(err))
			http.Error(w, "failed to verify token", http.StatusInternalServerError)
			return
		}
		// send automatic login request
		// to get JWT token ? manually for now
		jwt, err := auth.GenerateJWT(userID)
		if err != nil {
			http.Error(w, "failed to generate jwt", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"token": jwt,
		})

		// json.NewEncoder(w).Encode(userID)
	}

}

func sendVerificationEmail(email, name, verificationLink string) error {
	zap.L().Info("Sending verification email to:", zap.String("email", email), zap.String("name", name), zap.String("link", verificationLink))
	verifEmail.SendVerificationEmailBrevo(email, name, verificationLink)
	// verifEmail.SendVerificationEmailSendGrid(email,name, verificationLink)
	return nil
}

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
		name, err := CheckMembersList(db, credentials.Email)
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
		token, err := generateVerificationToken(db, credentials.Email, password, name)
		if err != nil {
			zap.L().Error("error generating verification token:", zap.Error(err))
			http.Error(w, "failed to generate verification token", http.StatusInternalServerError)
			return
		}

		// verificationLink := fmt.Sprintf("http://algoboost.foo/api/verify/%s", token)
		verificationLink := fmt.Sprintf("http://localhost:8080/api/verify?token=%s", token)
		err = sendVerificationEmail(credentials.Email, name, verificationLink)
		if err != nil {
			zap.L().Error("error sending verification email:", zap.Error(err))
			http.Error(w, "failed to send verification email", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode("verification email sent to " + credentials.Email)

	}
}

// хандлер api/submit
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

package receiver

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	"strconv"

	"AlgoBoostWebSite/internal/auth"
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/models"
	"context"

	"github.com/go-chi/chi/v5"
	kafka "github.com/segmentio/kafka-go"
)

var kafkaWriter *kafka.Writer = kafka.NewWriter(kafka.WriterConfig{
	Brokers: []string{"localhost:9092"},
	Topic:   "submissions",
})

func LoginUser(db *database.Database, email, password string) (models.User, error) {
	user, err := db.GetUserByEmail(email)
	if err != nil {
		return models.User{}, err
	}

	if user.Password != password {
		return models.User{}, errors.New("invalid credentials")
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
			log.Println("Login error:", err)
			http.Error(w, "failed to login", http.StatusInternalServerError)
			return
		}

		// generate JWT token
		token, err := auth.GenerateJWT(user.ID)
		if err != nil {
			log.Println("JWT generation error:", err)
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
		log.Println("Error checking whitelist:", err)
		return "", errors.New("failed to check whitelist")
	}
	if whitelist.Name == "" {
		log.Println("Email not allowed:", email)
		return "", errors.New("email not allowed")
	}
	return whitelist.Name, nil
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

		log.Println(credentials)
		log.Println(r.Body)

		if credentials.Email == "" || credentials.Password == "" {
			http.Error(w, "email and password are required", http.StatusBadRequest)
			return
		}

		// Check if the email is already registered
		existingUser, err := db.GetUserByEmail(credentials.Email)
		if err != nil {
			log.Println("Error checking existing user:", err)
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

		// create new user
		newUser := models.User{
			Name:     name,
			Email:    credentials.Email,
			Password: credentials.Password,
			Role:     "student",
		}

		userID, err := db.AddUser(newUser.Name, newUser.Email, newUser.Password, newUser.Role)
		if err != nil {
			log.Println("Error adding new user:", err)
			http.Error(w, "failed to register user", http.StatusInternalServerError)
			return
		}
		log.Println("New user with ID :", userID)
		json.NewEncoder(w).Encode(userID)
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
		log.Println("JSON marshal error:", err)
		http.Error(w, "failed to marshal request", http.StatusInternalServerError)
		return
	}

	// write the message to kafka
	err = kafkaWriter.WriteMessages(context.Background(), kafka.Message{
		Key:   []byte(r.Context().Value("userID").(string)),
		Value: value,
	})
	if err != nil {
		log.Println("Kafka write error:", err)
		http.Error(w, "failed to submit code", http.StatusInternalServerError)
		return
	}

	log.Println("code submitted to Kafka for task", req.TaskID)
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

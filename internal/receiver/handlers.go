package receiver

import (
	"encoding/json"
	"log"
	"net/http"

	"AlgoBoostWebSite/internal/auth"
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/models"
	"context"

	kafka "github.com/segmentio/kafka-go"
)

var kafkaWriter *kafka.Writer = kafka.NewWriter(kafka.WriterConfig{
	Brokers: []string{"localhost:9092"},
	Topic:   "submissions",
})

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

		user, err := db.LoginUser(credentials.Email, credentials.Password)
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
		// userID := 1
		userID := r.Context().Value("iserID").(int)

		lessons, err := db.GetAllLessonsWithTasks(userID)
		if err != nil {
			http.Error(w, "failed to fetch lessons", 500)
			return
		}

		json.NewEncoder(w).Encode(lessons)
	}
}

// func GetLessonByIdHandler(w http.ResponseWriter, r *http.Request) {

// }

// func GetTasksByLessonHandler(w http.ResponseWriter, r *http.Request) {

// }

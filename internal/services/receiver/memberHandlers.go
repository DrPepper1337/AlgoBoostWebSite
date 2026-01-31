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
	"AlgoBoostWebSite/internal/middleware"
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
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if credentials.Email == "" || credentials.Password == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "email and password are required", nil)
			return
		}

		// Check if the email is already registered
		existingUser, err := db.GetUserByEmail(credentials.Email)
		if err != nil {
			zap.L().Error("Error checking existing user:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to check existing user", nil)
			return
		}

		if existingUser.ID != 0 {
			utils.WriteJSON(w, http.StatusConflict, false, "email already registered", nil)
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
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to hash password", nil)
			return
		}

		password := string(hashedPassword)

		// email verification
		token, err := utils.GenerateVerificationToken(db, credentials.Email, password, whitelist.Name, whitelist.Role, "registration")
		if err != nil {
			zap.L().Error("error generating verification token:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to generate verification token", nil)
			return
		}

		verificationLink := fmt.Sprintf("http://localhost:5173/verify?token=%s", token)

		err = utils.SendVerificationEmail(credentials.Email, whitelist.Name, verificationLink)
		if err != nil {
			zap.L().Error("error sending verification email:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to send verification email", nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "verification email sent to "+credentials.Email, nil)
	}
}

func VerifyHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "token is required", nil)
			return
		}

		entry, err := db.GetValidRegistrationEntry(token)
		if err != nil {
			zap.L().Error("Error getting registration entry by token:", zap.Error(err))
			utils.WriteJSON(w, http.StatusUnauthorized, false, "invalid token", nil)
			return
		}

		if entry.TokenType == "registration" {
			userID, err := utils.RegisterUser(db, entry, token)
			if err != nil {
				zap.L().Error("Error registering user:", zap.Error(err))
				utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to register user: "+err.Error(), nil)
				return
			}

			jwt, err := utils.GenerateJWT(userID, entry.Role)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to generate jwt: "+err.Error(), nil)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			utils.WriteJSON(w, http.StatusOK, true, "verification successful", map[string]string{
				"token":   jwt,
				"user_id": strconv.Itoa(userID),
				"role":    entry.Role,
			})
		} else {
			err = utils.ResetPassword(db, entry)
			if err != nil {
				zap.L().Error("Error resetting password:", zap.Error(err))
				utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to reset password: "+err.Error(), nil)
				return
			}
			utils.WriteJSON(w, http.StatusOK, true, "password reset successful, you can now login with your new password", nil)
		}

		err = db.MarkTokenAsUsed(token)
		if err != nil {
			zap.L().Error("Error marking token as used:", zap.Error(err))
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
			utils.WriteJSON(w, http.StatusBadRequest, false, "Invalid request", nil)
			return
		}

		if req.Email == "" || req.Password == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "email and password are required", nil)
			return
		}

		user, err := db.GetUserByEmail(req.Email)
		if err != nil || user.ID == 0 {
			utils.WriteJSON(w, http.StatusNotFound, false, "user not found", nil)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to hash password: "+err.Error(), nil)
			return
		}

		password := string(hashedPassword)

		// Generate a password reset token
		token, err := utils.GenerateVerificationToken(db, req.Email, password, user.Name, user.Role, "password_reset")
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to generate token: "+err.Error(), nil)
			return
		}

		verificationLink := fmt.Sprintf("http://localhost:5173/verify?token=%s", token)

		// Send the reset email
		err = utils.SendResetPasswordEmail(req.Email, user.Name, verificationLink)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to send email: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "reset password email sent to "+req.Email, nil)
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
			utils.WriteJSON(w, http.StatusBadRequest, false, "Invalid request: "+err.Error(), nil)
			return
		}

		if credentials.Email == "" || credentials.Password == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "email and password are required", nil)
			return
		}

		user, err := utils.LoginUser(db, credentials.Email, credentials.Password)
		if err != nil {
			zap.L().Error("Login error:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to login: "+err.Error(), nil)
			return
		}

		// generate JWT token
		token, err := utils.GenerateJWT(user.ID, user.Role)
		if err != nil {
			zap.L().Error("JWT generation error:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to generate token: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "login successful", map[string]string{
			"token":   token,
			"user_id": strconv.Itoa(user.ID),
			"name":    user.Name,
			"role":    user.Role,
		})
	}
}

func GetAllLessonsHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := middleware.GetUserIDFromContext(r.Context())
		if !ok {
			utils.WriteJSON(w, http.StatusUnauthorized, false, "unauthorized: user ID not found", nil)
			return
		}

		lessons, err := db.GetAllLessonsWithTasks(userID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch lessons: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "lessons fetched successfully", lessons)
	}
}

func GetTasksByLessonIdHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		lessonID := chi.URLParam(r, "lessonID")
		if lessonID == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "lesson ID is required", nil)
			return
		}

		id, err := strconv.Atoi(lessonID)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid lesson ID: "+err.Error(), nil)
			return
		}

		tasks, err := db.GetTasksByLessonIdHandler(id)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch tasks: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "tasks fetched successfully", tasks)
	}
}

func GetTasksDetailsHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		taskID := chi.URLParam(r, "taskID")
		fmt.Println("Requested URL:", r.URL.Path)
		fmt.Println("Task ID:", taskID)
		if taskID == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "task ID is required", nil)
			return
		}

		id, err := strconv.Atoi(taskID)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid task ID: "+err.Error(), nil)
			return
		}

		task, err := db.GetTask(id)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch tasks: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "task fetched successfully", task)
	}

}

func GetUserSolutionsHandler(db *database.Database) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        userID, ok := middleware.GetUserIDFromContext(r.Context())
        if !ok {
            utils.WriteJSON(w, http.StatusUnauthorized, false, "unauthorized: user ID not found", nil)
            return
        }

        solutions, err := db.GetSolutionsByUserID(userID)
        if err != nil {
            utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch solutions: "+err.Error(), nil)
            return
        }

        utils.WriteJSON(w, http.StatusOK, true, "solutions fetched successfully", solutions)
    }
}


func GetUserStatsHandler(db *database.Database) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        userID, ok := middleware.GetUserIDFromContext(r.Context())
        if !ok {
            utils.WriteJSON(w, http.StatusUnauthorized, false, "unauthorized: user ID not found", nil)
            return
        }

        solved, err := db.GetSolvedUserTasks(userID)
        if err != nil {
            utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch solved count: "+err.Error(), nil)
            return
        }

        total, err := db.GetTotalNumPracticeTasks()
        if err != nil {
            utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch total count: "+err.Error(), nil)
            return
        }

		attempted, err := db.GetAttemptedUserTasks(userID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch attempted count: "+err.Error(), nil)
			return
		}

        utils.WriteJSON(w, http.StatusOK, true, "stats fetched successfully", map[string]int{
            "solved": solved,
            "total":  total,
            "attempted": attempted,
        })
    }
}

func SubmitHandler(w http.ResponseWriter, r *http.Request) {
	var req models.Solution
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request: "+err.Error(), nil)
		return
	}

	// serialise as json to end to kafka
	// converts the request to a JSON-formatted byte slice
	value, err := json.Marshal(req)
	if err != nil {
		zap.L().Error("JSON marshal error:", zap.Error(err))
		utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to marshal request: "+err.Error(), nil)
		return
	}

	// write the message to kafka
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		utils.WriteJSON(w, http.StatusUnauthorized, false, "unauthorized: user ID not found", nil)
		return
	}

	err = kafkaWriter.WriteMessages(context.Background(), kafka.Message{
		Key:   []byte(strconv.Itoa(userID)),
		Value: value,
	})
	if err != nil {
		zap.L().Error("Kafka write error:", zap.Error(err))
		utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to submit code: "+err.Error(), nil)
		return
	}

	zap.L().Info("code submitted to Kafka for task", zap.String("taskID", strconv.Itoa(req.TaskID)))
	utils.WriteJSON(w, http.StatusOK, true, "code submitted successfully", nil)
}

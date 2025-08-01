package receiver

import (
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/models"
	"AlgoBoostWebSite/internal/utils"

	"encoding/json"
	"net/http"
	"strconv"

	"go.uber.org/zap"
)

// LESSON handlers
func AddLessonHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var lesson models.Lesson
		err := json.NewDecoder(r.Body).Decode(&lesson)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if lesson.Title == "" || lesson.Description == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "title and description are required", nil)
			return
		}

		id, err := db.AddLesson(lesson.Title, lesson.Description)
		if err != nil {
			zap.L().Error("Error adding lesson:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to add lesson: "+err.Error(), nil)
			return
		}

		w.WriteHeader(http.StatusCreated)
		response := map[string]int{"lesson_id": id}
		utils.WriteJSON(w, http.StatusCreated, true, "lesson created successfully", response)
	}
}

func AddTaskToLessonHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type taskData struct {
			TaskID   int `json:"task_id"`
			LessonID int `json:"lesson_id"`
		}

		var data taskData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if data.TaskID == 0 || data.LessonID == 0 {
			utils.WriteJSON(w, http.StatusBadRequest, false, "task_id and lesson_id are required", nil)
			return
		}

		err = db.AddTaskToLesson(data.TaskID, data.LessonID)
		if err != nil {
			zap.L().Error("Error adding task to lesson:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to add task to lesson: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "task with ID "+strconv.Itoa(data.TaskID)+" added to lesson with ID "+strconv.Itoa(data.LessonID)+" successfully", nil)
	}
}

func DeleteTaskFromLessonHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type taskData struct {
			TaskID   int `json:"task_id"`
			LessonID int `json:"lesson_id"`
		}

		var data taskData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if data.TaskID == 0 || data.LessonID == 0 {
			utils.WriteJSON(w, http.StatusBadRequest, false, "task_id and lesson_id are required", nil)
			return
		}

		err = db.DeleteTaskFromLesson(data.TaskID, data.LessonID)
		if err != nil {
			zap.L().Error("Error deleting task from lesson:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to delete task from lesson: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "task with id "+strconv.Itoa(data.TaskID)+" deleted from lesson with id "+strconv.Itoa(data.LessonID)+" successfully", nil)
	}
}

func DeleteLessonHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type lessonData struct {
			LessonID int `json:"lesson_id"`
		}
		var data lessonData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		err = db.DeleteLesson(data.LessonID)
		if err != nil {
			zap.L().Error("Error deleting lesson:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to delete lesson: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "lesson with id "+strconv.Itoa(data.LessonID)+" deleted successfully", nil)
	}
}

// TASK handlers
func AddTaskHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var task models.Task
		err := json.NewDecoder(r.Body).Decode(&task)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if task.Title == "" || task.Description == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "title and description are required", nil)
			return
		}

		id, err := db.AddTask(task.Title, task.Description, task.TimeLimit, task.MemoryLimit, task.IsPractice)
		if err != nil {
			zap.L().Error("Error adding task:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to add task: "+err.Error(), nil)
			return
		}

		w.WriteHeader(http.StatusCreated)
		response := map[string]int{"task_id": id}
		utils.WriteJSON(w, http.StatusCreated, true, "task created successfully", response)
	}
}

func EditTaskHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var task models.Task
		err := json.NewDecoder(r.Body).Decode(&task)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if task.ID == 0 || task.Title == "" || task.Description == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "task_id, title, and description are required", nil)
			return
		}

		err = db.EditTask(task.ID, task.Title, task.Description, task.TimeLimit, task.MemoryLimit, task.IsPractice)
		if err != nil {
			zap.L().Error("Error editing task:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to edit task: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "task with ID "+strconv.Itoa(task.ID)+" edited successfully", nil)
	}
}

func DeleteTaskHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type taskData struct {
			TaskID int `json:"task_id"`
		}
		var data taskData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		err = db.DeleteTask(data.TaskID)
		if err != nil {
			zap.L().Error("Error deleting task:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to delete task with ID "+strconv.Itoa(data.TaskID), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "task with ID "+strconv.Itoa(data.TaskID)+" deleted successfully", nil)
	}
}

// USER HANDLERS
func GetAllUSersHAndler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users, err := db.GetAllUsers()
		if err != nil {
			zap.L().Error("Error getting all users:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to get all users", nil)
			return
		}
		utils.WriteJSON(w, http.StatusOK, true, "users fetched successfully", users)
	}
}

func AddEmalToWhitelistHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var whitelist models.Whitelist
		err := json.NewDecoder(r.Body).Decode(&whitelist)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if whitelist.Email == "" || whitelist.Name == "" || whitelist.Role == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "Email, Name and Role are required", nil)
			return
		}

		err = db.AddEmailToWhitelist(whitelist.Email, whitelist.Name, whitelist.Role)
		if err != nil {
			zap.L().Error("Error adding email to whitelist:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to add email to whitelist: "+err.Error(), nil)
			return
		}

		w.WriteHeader(http.StatusCreated)
		utils.WriteJSON(w, http.StatusCreated, true, "email added whitelis successfully", nil)
	}
}

func DeleteEmalToWhitelistHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type emailData struct {
			Email string `json:"email"`
		}
		var data emailData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		err = db.DeleteEmailFromWhitelist(data.Email)
		if err != nil {
			zap.L().Error("Error deleting task:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to delete task with email "+data.Email, nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "user with email "+data.Email+" deleted from whitelist successfully", nil)
	}
}

func EditUserHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user models.User
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if user.ID == 0 || user.Name == "" || user.Password == "" || user.Email == "" || user.Role == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "User ID, Name, Password, email, and Role are required", nil)
			return
		}

		err = db.EditUser(user.ID, user.Name, user.Email, user.Password, user.Role)
		if err != nil {
			zap.L().Error("Error editing user:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to edit user: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "user with ID "+strconv.Itoa(user.ID)+" edited successfully", nil)
	}
}

func DeleteUserHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type userData struct {
			UserId int `json:"id"`
		}
		var data userData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		err = db.DeleteUser(data.UserId)
		if err != nil {
			zap.L().Error("Error deleting user:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to delete task with ID "+strconv.Itoa(data.UserId), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "user with ID "+strconv.Itoa(data.UserId)+" deleted successfully", nil)
	}
}

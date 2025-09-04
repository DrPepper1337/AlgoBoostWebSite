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

func GetAdminsHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		admins, err := db.GetAdmins()
		if err != nil {
			zap.L().Error("Error fetching admins:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch admins", nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "admins fetched successfully", admins)
	}
}

func GetMembersHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		members, err := db.GetMembers()
		if err != nil {
			zap.L().Error("Error fetching members:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch members", nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "members fetched successfully", members)
	}
}

func GetWhitelistHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		whitelist, err := db.GetWhitelist()
		if err != nil {
			zap.L().Error("Error fetching whitelist:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to fetch whitelist", nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "whitelist fetched successfully", whitelist)
	}
}

func EditUserHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type userData struct {
			UserID   int    `json:"id"`
			Property string `json:"property"`
			Value    string `json:"value"`
		}
		var data userData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if data.UserID == 0 || data.Property == "" || data.Value == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "user_id, property, and value are required", nil)
			return
		}

		err = db.EditUser(data.UserID, data.Property, data.Value)
		if err != nil {
			zap.L().Error("Error editing user:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to edit user: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "user with ID "+strconv.Itoa(data.UserID)+" edited successfully", nil)
	}
}

func EditWhitelistHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type whitelistData struct {
			WhitelistID int    `json:"id"`
			Property    string `json:"property"`
			Value       string `json:"value"`
		}

		var data whitelistData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if data.WhitelistID == 0 || data.Property == "" || data.Value == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "user_id, property, and value are required", nil)
			return
		}

		err = db.EditWhitelist(data.WhitelistID, data.Property, data.Value)
		if err != nil {
			zap.L().Error("Error editing whitelist:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to edit whitelist: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "whitelist with ID "+strconv.Itoa(data.WhitelistID)+" edited successfully", nil)
	}
}

func DeleteUserHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type userData struct {
			UserID int `json:"id"`
		}
		var data userData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if data.UserID == 0 {
			utils.WriteJSON(w, http.StatusBadRequest, false, "user_id is required", nil)
			return
		}

		err = db.DeleteUser(data.UserID)
		if err != nil {
			zap.L().Error("Error deleting user:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to delete user: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "user with ID "+strconv.Itoa(data.UserID)+" deleted successfully", nil)
	}
}

func AddEmailToWhitelistHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type emailData struct {
			Email string `json:"email"`
			Name  string `json:"name"`
			Role  string `json:"role"`
		}
		var data emailData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if data.Email == "" {
			utils.WriteJSON(w, http.StatusBadRequest, false, "email is required", nil)
			return
		}

		err = db.AddEmailToWhitelist(data.Email, data.Name, data.Role)
		if err != nil {
			zap.L().Error("Error adding email to whitelist:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to add email to whitelist: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "email "+data.Email+" added to whitelist successfully", nil)
	}
}

func DeleteEmailFromWhitelistHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type emailData struct {
			Id int `json:"id"`
		}
		var data emailData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "invalid request payload", nil)
			return
		}

		if data.Id < 0 {
			utils.WriteJSON(w, http.StatusBadRequest, false, "id is required", nil)
			return
		}

		err = db.DeleteEmailFromWhitelist(data.Id)
		if err != nil {
			zap.L().Error("Error deleting email from whitelist:", zap.Error(err))
			utils.WriteJSON(w, http.StatusInternalServerError, false, "failed to delete email from whitelist: "+err.Error(), nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "entry deleted from whitelist successfully", nil)
	}
}

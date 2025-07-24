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
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if lesson.Title == "" || lesson.Description == "" {
			http.Error(w, "title and description are required", http.StatusBadRequest)
			return
		}

		id, err := db.AddLesson(lesson.Title, lesson.Description)
		if err != nil {
			zap.L().Error("Error adding lesson:", zap.Error(err))
			http.Error(w, "failed to add lesson: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		response := map[string]int{"lesson_id": id}
		json.NewEncoder(w).Encode(response)
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
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if data.TaskID == 0 || data.LessonID == 0 {
			http.Error(w, "task_id and lesson_id are required", http.StatusBadRequest)
			return
		}

		err = db.AddTaskToLesson(data.TaskID, data.LessonID)
		if err != nil {
			zap.L().Error("Error adding task to lesson:", zap.Error(err))
			http.Error(w, "failed to add task to lesson: "+err.Error(), http.StatusInternalServerError)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "task added to lesson successfully", nil)
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
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if data.TaskID == 0 || data.LessonID == 0 {
			http.Error(w, "task_id and lesson_id are required", http.StatusBadRequest)
			return
		}

		err = db.DeleteTaskFromLesson(data.TaskID, data.LessonID)
		if err != nil {
			zap.L().Error("Error deleting task from lesson:", zap.Error(err))
			http.Error(w, "failed to delete task from lesson: "+err.Error(), http.StatusInternalServerError)
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
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		err = db.DeleteLesson(data.LessonID)
		if err != nil {
			zap.L().Error("Error deleting lesson:", zap.Error(err))
			http.Error(w, "failed to delete lesson: "+err.Error(), http.StatusInternalServerError)
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
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if task.Title == "" || task.Description == "" {
			http.Error(w, "title and description are required", http.StatusBadRequest)
			return
		}

		id, err := db.AddTask(task.Title, task.Description, task.TimeLimit, task.MemoryLimit, task.IsPractice)
		if err != nil {
			zap.L().Error("Error adding task:", zap.Error(err))
			http.Error(w, "failed to add task: "+err.Error(), http.StatusInternalServerError)
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
			http.Error(w, "Invalid request: "+err.Error(), http.StatusBadRequest)
			return
		}

		if task.ID == 0 || task.Title == "" || task.Description == "" {
			http.Error(w, "task_id, name and description are required", http.StatusBadRequest)
			return
		}

		err = db.EditTask(task.ID, task.Title, task.Description, task.TimeLimit, task.MemoryLimit, task.IsPractice)
		if err != nil {
			zap.L().Error("Error editing task:", zap.Error(err))
			http.Error(w, "failed to edit task: "+err.Error(), http.StatusInternalServerError)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "task edited successfully", nil)
	}
}

func DeleteTaskHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		taskID := r.URL.Query().Get("task_id")
		if taskID == "" {
			http.Error(w, "task_id is required", http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(taskID)
		if err != nil {
			http.Error(w, "invalid task_id", http.StatusBadRequest)
			return
		}

		err = db.DeleteTask(id)
		if err != nil {
			zap.L().Error("Error deleting task:", zap.Error(err))
			http.Error(w, "failed to delete task", http.StatusInternalServerError)
			return
		}

		utils.WriteJSON(w, http.StatusNoContent, true, "task deleted successfully", nil)
	}
}

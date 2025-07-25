package receiver

import (
	"AlgoBoostWebSite/internal/database"
	// "AlgoBoostWebSite/internal/utils"
	"encoding/json"
	"net/http"

	"go.uber.org/zap"
)

func AddLessonHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type lessonData struct {
			Name        string `json:"name"`
			Description string `json:"description"`
		}

		var lesson lessonData
		err := json.NewDecoder(r.Body).Decode(&lesson)
		if err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		if lesson.Name == "" || lesson.Description == "" {
			http.Error(w, "name and description are required", http.StatusBadRequest)
			return
		}

		id, err := db.AddLesson(lesson.Name, lesson.Description)
		if err != nil {
			zap.L().Error("Error adding lesson:", zap.Error(err))
			http.Error(w, "failed to add lesson", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		response := map[string]int{"lesson_id": id}
		json.NewEncoder(w).Encode(response)
	}
}

// func AddTaskToLessonHandler(db *database.Database) http.HandlerFunc {}

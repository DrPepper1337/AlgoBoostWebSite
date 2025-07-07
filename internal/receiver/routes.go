package receiver

import (
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/middleware"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func SetupRoutes(db *database.Database) http.Handler {
	r := chi.NewRouter()

	// CORS things
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))

	r.Post("/api/submit", SubmitHandler)
	r.Post("/api/login", LoginHandler(db))

	r.With(middleware.JWTMiddleware).Get("/api/lessons", GetAllLessonsHandler(db))
	r.With(middleware.JWTMiddleware).Get("/api/tasks/{taskID}", GetTasksDetailsHandler(db))

	// unused roites
	// r.Get("api/tasks/{lessonID}", GetTasksByLessonIdHandler(db))
	// r.Get("api/tasks/{lessonID}", GetTasksByLessonHandler)
	// user stats and progress handlers and routes as future improvements

	return r
}

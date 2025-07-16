package receiver

import (
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/middleware"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func SetupRoutes(db *database.Database) http.Handler {
	r := chi.NewRouter()

	r.Post("/api/submit", SubmitHandler)

	r.Post("/api/login", LoginHandler(db))
	r.Post("/api/register", RegistrationHandler(db))
	r.Post("/api/verify/{token}", VerifyHandler(db))

	r.With(middleware.JWTMiddleware).Get("/api/lessons", GetAllLessonsHandler(db))

	r.With(middleware.JWTMiddleware).Get("/api/tasks/{taskID}", GetTasksDetailsHandler(db))

	// unused roites
	// r.Get("api/tasks/{lessonID}", GetTasksByLessonIdHandler(db))
	// r.Get("api/tasks/{lessonID}", GetTasksByLessonHandler)
	// user stats and progress handlers and routes as future improvements

	return r
}

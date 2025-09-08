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

	// MEMBER ROUTES
	r.Post("/api/submit", SubmitHandler)
	r.Post("/api/login", LoginHandler(db))
	r.Post("/api/register", RegistrationHandler(db))
	r.Get("/api/verify", VerifyHandler(db))
	r.Post("/api/request-reset-password", RequestResetPasswordHandler(db))
	r.Get("/api/reset-password", VerifyHandler(db))

	r.With(middleware.MemberMiddleware).Get("/api/lessons", GetAllLessonsHandler(db))
	r.With(middleware.MemberMiddleware).Get("/api/tasks/{taskID}", GetTasksDetailsHandler(db))

	// user stats and progress handlers and routes as future improvements

	// ADMIN ROUTES
	r.With(middleware.AdminMiddleware).Post("/api/admin/add-lesson", AddLessonHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/add-task-to-lesson", AddTaskToLessonHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/delete-task-from-lesson", DeleteTaskFromLessonHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/delete-lesson", DeleteLessonHandler(db))

	r.With(middleware.AdminMiddleware).Post("/api/admin/add-task", AddTaskHandler(db)) //task creation
	r.With(middleware.AdminMiddleware).Post("/api/admin/edit-task", EditTaskHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/delete-task", DeleteTaskHandler(db))

	r.With(middleware.AdminMiddleware).Get("/api/admin/admins", GetAdminsHandler(db))
	r.With(middleware.AdminMiddleware).Get("/api/admin/members", GetMembersHandler(db))
	r.With(middleware.AdminMiddleware).Get("/api/admin/whitelist", GetWhitelistHandler(db))

	r.With(middleware.AdminMiddleware).Post("/api/admin/edit-user", EditUserHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/delete-user", DeleteUserHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/add-email-to-whitelist", AddEmailToWhitelistHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/delete-email-from-whitelist", DeleteEmailFromWhitelistHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/edit-whitelist", EditWhitelistHandler(db))

	return r
}

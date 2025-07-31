package receiver

import (
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/middleware"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func SetupRoutes(db *database.Database) http.Handler {
	r := chi.NewRouter()

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
	// // r.With(middleware.AdminMiddleware).Post("/api/admin/edit-lesson", EditLessonHandler(db))

	r.With(middleware.AdminMiddleware).Post("/api/admin/add-task", AddTaskHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/edit-task", EditTaskHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/delete-task", DeleteTaskHandler(db))

	r.With(middleware.AdminMiddleware).Post("/api/admin/get-all-users", GetAllUSersHAndler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/edit-user", EditUserHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/add-email-to-whitelist", AddEmalToWhitelistHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/delete-email-from-whitelist", AddEmalToWhitelistHandler(db))
	r.With(middleware.AdminMiddleware).Post("/api/admin/delete-user", DeleteUserHandler(db))
	return r
}

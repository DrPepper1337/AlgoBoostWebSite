package receiver

import(
	"net/http"
	"github.com/go-chi/chi/v5"
)

func SetupRoutes() http.Handler {
	r := chi.NewRouter()

	r.Post("/api/submit", SubmitHandler)
	// TODO: more API requests to be added

	return r
}
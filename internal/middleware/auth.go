package middleware

import (
	"context"
	"net/http"
	"strings"

	"AlgoBoostWebSite/internal/auth"

	"github.com/golang-jwt/jwt/v5"
)

func MemberMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "no auth header, wtf", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ") // removes the "Bearer " prefix if present
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return auth.JWTSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		// claims is the data in the JWT payload map
		userID := int(claims["user_id"].(float64))

		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "no auth header, wtf", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return auth.JWTSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		role := claims["role"].(string)

		if role != "admin" {
			http.Error(w, "forbidden: admin access required", http.StatusForbidden)
			return
		}
		// maybe send admin user id as well in context ??
		next.ServeHTTP(w, r)
	})
}

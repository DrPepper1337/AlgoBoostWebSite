package middleware

import (
	"net/http"
	"strings"
	"context"

	"github.com/golang-jwt/jwt/v5"
	"AlgoBoostWebSite/internal/auth"
)

func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
		authHeader := r.Header.Get("Authorisation")
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

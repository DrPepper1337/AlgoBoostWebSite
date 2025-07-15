package auth

import (
	"time"
	"github.com/golang-jwt/jwt/v5"
)

var JWTSecret = []byte("we-are-very-secure-fore-sure") // env var in production

func GenerateJWT(userID int) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims {
		"user_id": userID,
		"exp": time.Now().Add(24 * time.Hour).Unix(), // 24 hour validity
	})

	return token.SignedString(JWTSecret) // signing that shit
}
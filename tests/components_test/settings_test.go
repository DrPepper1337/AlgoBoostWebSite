package components_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "AlgoBoostWebSite/internal/database"
    "AlgoBoostWebSite/internal/middleware"
	"AlgoBoostWebSite/internal/services/receiver"


    "github.com/joho/godotenv"
    "golang.org/x/crypto/bcrypt"
    "go.uber.org/zap"
)


func TestUpdateUserNameHandler(t *testing.T) {
    // Setup test database
    db := setupTestDB()
    defer cleanupTestDB(db)

    // Create a test user
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("testpass"), bcrypt.DefaultCost)
    userID, err := db.AddUser("OldName", "testname@example.com", string(hashedPassword), "member")
    if err != nil {
        t.Fatalf("Failed to create test user: %v", err)
    }

    // Test cases 
    tests := []struct {
        name           string
        payload        map[string]string
        userID         int
        expectedStatus int
        expectedMsg    string
    }{
        {
            name:           "Valid name update",
            payload:        map[string]string{"name": "NewName"},
            userID:         userID,
            expectedStatus: http.StatusOK,
            expectedMsg:    "name updated successfully",
        },
        {
            name:           "Empty name",
            payload:        map[string]string{"name": ""},
            userID:         userID,
            expectedStatus: http.StatusBadRequest,
            expectedMsg:    "name cannot be empty",
        },
        {
            name:           "Missing name field",
            payload:        map[string]string{},
            userID:         userID,
            expectedStatus: http.StatusBadRequest,
            expectedMsg:    "name cannot be empty",
        },
    }

    // Running each test case
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            body, _ := json.Marshal(tt.payload)
            req := httptest.NewRequest(http.MethodPut, "/api/user/details", bytes.NewBuffer(body))
            req.Header.Set("Content-Type", "application/json")
            req = req.WithContext(middleware.SetUserIDInContext(req.Context(), tt.userID))

            rr := httptest.NewRecorder()
            handler := receiver.UpdateUserNameHandler(db)
            handler.ServeHTTP(rr, req)

            if rr.Code != tt.expectedStatus {
                t.Errorf("Expected status %d, got %d", tt.expectedStatus, rr.Code)
            }

            var response map[string]interface{}
            if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
                t.Fatalf("Failed to unmarshal response: %v", err)
            }
            if response["message"] != tt.expectedMsg {
                t.Errorf("Expected message '%s', got '%s'", tt.expectedMsg, response["message"])
            }
        })
    }
}

func TestChangePasswordHandler(t *testing.T) {
    db := setupTestDB()
    defer cleanupTestDB(db)

    // Create a test user with known password
    currentPassword := "oldPassword123"
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(currentPassword), bcrypt.DefaultCost)
    userID, err := db.AddUser("TestUser", "testpassword@example.com", string(hashedPassword), "member")
    if err != nil {
        panic(err)
    }

    tests := []struct {
        name           string
        payload        map[string]string
        userID         int
        expectedStatus int
        expectedMsg    string
    }{
        {
            name: "Valid password change",
            payload: map[string]string{
                "currentPassword": currentPassword,
                "newPassword":     "newPassword456",
            },
            userID:         userID,
            expectedStatus: http.StatusOK,
            expectedMsg:    "password changed successfully",
        },
        {
            name: "Incorrect current password",
            payload: map[string]string{
                "currentPassword": "wrongPassword",
                "newPassword":     "newPassword456",
            },
            userID:         userID,
            expectedStatus: http.StatusUnauthorized,
            expectedMsg:    "current password is incorrect",
        },
        {
            name: "Missing current password",
            payload: map[string]string{
                "currentPassword": "",
                "newPassword":     "newPassword456",
            },
            userID:         userID,
            expectedStatus: http.StatusBadRequest,
            expectedMsg:    "current and new password are required",
        },
        {
            name: "Missing new password",
            payload: map[string]string{
                "currentPassword": currentPassword,
                "newPassword":     "",
            },
            userID:         userID,
            expectedStatus: http.StatusBadRequest,
            expectedMsg:    "current and new password are required",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            body, _ := json.Marshal(tt.payload)
            req := httptest.NewRequest(http.MethodPut, "/api/user/password", bytes.NewBuffer(body))
            req.Header.Set("Content-Type", "application/json")
            req = req.WithContext(middleware.
                SetUserIDInContext(req.Context(), tt.userID))

            rr := httptest.NewRecorder()
            handler := receiver.ChangePasswordHandler(db)
            handler.ServeHTTP(rr, req)

            if rr.Code != tt.expectedStatus {
                t.Errorf("Expected status %d, got %d", tt.expectedStatus, rr.Code)
            }

            var response map[string]interface{}
            if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
                t.Fatalf("Failed to unmarshal response: %v", err)
            }      
            if response["message"] != tt.expectedMsg {
                t.Errorf("Expected message '%s', got '%s'", tt.expectedMsg, response["message"])
            }
        })
    }
}

// Helper functions
func setupTestDB() *database.Database {
	if err := godotenv.Load("../../.env", "../../configs/Docker.dev.env", "../../configs/Docker.env"); err != nil {
        zap.L().Warn("env file not found, relying on existing environment", zap.Error(err))
    }
    
    db, err := database.NewDatabase()
    if err != nil {
        panic(err)
    }
    
    if err = db.DropTables(); err != nil {
        db.Close()
        panic(err)
    }
    
    if err = db.CreateTables(); err != nil {
        db.Close()
        panic(err)
    }

    return db
}

func cleanupTestDB(db *database.Database) {
    if db != nil {
		db.Close()
	}
}
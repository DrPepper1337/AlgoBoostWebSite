package tests

import (
	"AlgoBoostWebSite/internal/database"
	"errors"
	"github.com/joho/godotenv"
	"os"
	"testing"
)

func setup() {
	if err := godotenv.Load("../configs/.env"); err != nil {
		panic(err)
	}
	db, err := database.NewDatabase()
	defer db.Close()
	if err != nil {
		panic(err)
	}
	if err = db.DropTables(); err != nil {
		panic(err)
	}
	if err = db.CreateTables(); err != nil {
		panic(err)
	}
}

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	os.Exit(code)
}

func TestAddUser(t *testing.T) {
	db, _ := database.NewDatabase()
	defer db.Close()
	var tests = []struct {
		email    string
		password string
		role     string
		wantID   int
		wantErr  error
	}{
		{"example1@gmail.com", "123", "admin", 1, nil},
		{"example1@gmail.com", "123", "admin", 0, errors.New("user already exists")},
		{"example2@gmail.com", "123", "admin", 3, nil},
		{"example3@gmail.com", "123", "admin", 4, nil},
	}
	for _, test := range tests {
		id, err := db.AddUser(test.email, test.password, test.role)
		if test.wantErr != nil {
			if err.Error() != test.wantErr.Error() {
				t.Errorf("AddUser(%s, %s, %s) = %d, %v; want %d, %v", test.email, test.password, test.role, id, err, test.wantID, test.wantErr)
			}
		} else {
			if id != test.wantID || !errors.Is(err, test.wantErr) {
				t.Errorf("AddUser(%s, %s, %s) = %d, %v; want %d, %v", test.email, test.password, test.role, id, err, test.wantID, test.wantErr)
			}
		}
	}
}

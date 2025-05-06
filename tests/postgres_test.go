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

func finish() {
	db, err := database.NewDatabase()
	defer db.Close()
	if err != nil {
		panic(err)
	}
	if err = db.DropTables(); err != nil {
		panic(err)
	}
}

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	finish()
	os.Exit(code)
}

func TestAddUser(t *testing.T) {
	db, _ := database.NewDatabase()
	defer db.Close()
	id, err := db.AddUser("fedor", "example1@gmail.com", "123", "admin")
	if err != nil {
		t.Errorf("AddUser failed with error: %v", err)
	}
	user, err := db.GetUser(id)
	if err != nil {
		t.Errorf("GetUser failed with error: %v", err)
	}
	if user.Email != "example1@gmail.com" || user.Password != "123" || user.Role != "admin" {
		t.Errorf("User weren't added to the database correctly. (email: %s, password: %s, role: %s)", user.Email, user.Password, user.Role)
	}
	id, err = db.AddUser("fedor", "example1@gmail.com", "123", "admin")
	if err == nil {
		t.Errorf("AddUser should have failed, in case of an existing user")
	}
}

func TestDeleteUser(t *testing.T) {
	db, _ := database.NewDatabase()
	defer db.Close()
	var tests = []struct {
		id      int
		wantErr error
	}{
		{1, nil},
		{2, nil},
		{3, nil},
	}
	for _, test := range tests {
		err := db.DeleteUser(test.id)
		if !errors.Is(err, test.wantErr) {
			t.Errorf("Delete user failed with error: %v", err)
		}
	}
}

func TestEditUser(t *testing.T) {
	db, _ := database.NewDatabase()
	defer db.Close()
	_, err := db.AddUser("fedor", "example1@gmail.com", "123", "admin")
	if err != nil {
		t.Errorf("AddUser failed with error: %v", err)
	}
	id, err := db.AddUser("fedor", "example2@gmail.com", "123", "admin")
	if err != nil {
		t.Errorf("AddUser failed with error: %v", err)
	}
	err = db.EditUser(id, "fedor", "example1@gmail.com", "123", "admin")
	if err != nil {
		t.Errorf("EditUser failed with error: %v", err)
	}
	user, _ := db.GetUser(id)
	if user.Email != "example2@gmail.com" {
		t.Errorf("user shouldn't be updated")
	}
	err = db.EditUser(id, "fedor", "example3@gmail.com", "123", "admin")
	if err != nil {
		t.Errorf("EditUser failed with error: %v", err)
	}
	user, _ = db.GetUser(id)
	if user.Email != "example3@gmail.com" {
		t.Errorf("user should be updated")
	}
}

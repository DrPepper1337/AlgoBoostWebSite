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
	id, err := db.AddUser("example1@gmail.com", "123", "admin")
	if id != 1 || err != nil {
		t.Errorf("AddUser failed with error: %v", err)
	}
	id, err = db.AddUser("example1@gmail.com", "123", "admin")
	if err == nil {
		t.Errorf("AddUser should have failed, in case of an existing user")
	}
	id, err = db.AddUser("example2@gmail.com", "123", "admin")
	if id != 3 || err != nil {
		t.Errorf("AddUser failed with error: %v", err)
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

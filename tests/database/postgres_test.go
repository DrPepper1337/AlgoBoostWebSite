package tests

import (
	"AlgoBoostWebSite/internal/database"
	"errors"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
	"os"
	"testing"
)

func setup() {
	if err := godotenv.Load("../../configs/.env"); err != nil {
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

func TestAddLesson(t *testing.T) {
	db, _ := database.NewDatabase()
	defer db.Close()
	id, err := db.AddLesson("lesson1", "description1")
	if err != nil {
		t.Errorf("AddLesson failed with error: %v", err)
	}
	lesson, err := db.GetLesson(id)
	zap.L().Debug("lesson", zap.Any("lesson", lesson))
	if err != nil {
		t.Errorf("GetLesson failed with error: %v", err)
	}
	if lesson.Title != "lesson1" || lesson.Description != "description1" {
		t.Errorf("Lesson weren't added to the database correctly. (title: %s, description: %s)", lesson.Title, lesson.Description)
	}
}

func TestDeleteLesson(t *testing.T) {
	db, _ := database.NewDatabase()
	defer db.Close()
	id, err := db.AddLesson("lesson1", "description1")
	if err != nil {
		t.Errorf("AddLesson failed with error: %v", err)
	}
	err = db.DeleteLesson(id)
	if err != nil {
		t.Errorf("DeleteLesson failed with error: %v", err)
	}
	_, err = db.GetLesson(id)
	if err == nil {
		t.Errorf("GetLesson should have failed after deleting lesson")
	}
}

func TestEditLesson(t *testing.T) {
	db, _ := database.NewDatabase()
	defer db.Close()
	id, err := db.AddLesson("lesson1", "description1")
	if err != nil {
		t.Errorf("AddLesson failed with error: %v", err)
	}
	err = db.EditLesson(id, "lesson2", "description2")
	if err != nil {
		t.Errorf("EditLesson failed with error: %v", err)
	}
	lesson, err := db.GetLesson(id)
	if err != nil {
		t.Errorf("GetLesson failed with error: %v", err)
	}
	if lesson.Title != "lesson2" || lesson.Description != "description2" {
		t.Errorf("Lesson weren't updated in the database correctly. (title: %s, description: %s)", lesson.Title, lesson.Description)
	}
}

func TestSetLessonVisability(t *testing.T) {
	db, _ := database.NewDatabase()
	defer db.Close()
	id, err := db.AddLesson("lesson123", "description1")
	t.Log(id)
	if err != nil {
		t.Errorf("AddLesson failed with error: %v", err)
	}
	err = db.SetLessonVisability(id, true)
	if err != nil {
		t.Errorf("SetLessonVisability failed with error: %v", err)
	}
	lesson, err := db.GetLesson(id)
	if err != nil {
		t.Errorf("GetLesson failed with error: %v", err)
	}
	if lesson.Open != true {
		t.Errorf("Lesson visibility wasn't updated in the database correctly. (open: %t)", lesson.Open)
	}
}

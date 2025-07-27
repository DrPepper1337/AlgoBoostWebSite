package main

import (
	"AlgoBoostWebSite/internal/config"
	"AlgoBoostWebSite/internal/database"

	"golang.org/x/crypto/bcrypt"

	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"AlgoBoostWebSite/internal/receiver"
	"log"
	"net/http"
)

func main() {
	config.InitLogger(true)
	if err := godotenv.Load("./configs/.env"); err != nil {
		panic(err)
	}
	db, err := database.NewDatabase()
	if err != nil {
		zap.L().Debug(err.Error())
	}
	err = db.DropTables()
	if err != nil {
		zap.L().Debug(err.Error())
	}
	err = db.CreateTables()
	if err != nil {
		zap.L().Debug(err.Error())
	}

	// task 1 is in lesson 1, but task 2 is just there, unnattached
	id, err := db.AddTask("Task 1", "decription 1 (linked to lesson 1)", 10, 250, true)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	id1, _ := db.AddLesson("Lesson 1", "Description 1")
	err = db.AddTaskToLesson(id, id1)
	db.SetLessonVisability(id1, true)

	id, err = db.AddTask("Task 2", "unnattached", 0, 0, false)
	if err != nil {
		zap.L().Debug(err.Error())
	}

	// test users
	const password = "test123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return
	}
	_, err = db.AddUser("test", "test1@gmail.com", string(hashedPassword), "admin")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	_, err = db.AddUser("test", "test2@gmail.com", string(hashedPassword), "member")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	err = db.AddEmailToWhitelist("stasymartinson@gmail.com", "test guy", "member")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	// initialises the receiver
	r := receiver.SetupRoutes(db)
	log.Println("receiver running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
	// ---

}

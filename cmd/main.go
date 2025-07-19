package main

import (
	"AlgoBoostWebSite/internal/config"
	"AlgoBoostWebSite/internal/database"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	config.InitLogger(true)
	if err := godotenv.Load("../configs/.env"); err != nil {
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
	id, err := db.AddTask("banana", "shit", 10, 250, true)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	id1, _ := db.AddLesson("hui", "shit")
	err = db.AddTaskToLesson(id, id1)
	db.SetLessonVisability(id1, true)

	db.SetLessonVisability(id1, false)
	id, err = db.AddTask("apple", "shit1", 0, 0, false)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	db.EditLesson(id1, "her", "shiiit")
	db.AddTaskToLesson(id, id1)
	result, err := db.GetLesson(id1)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	zap.L().Debug("a", zap.Any("ads", result.Tasks))
}

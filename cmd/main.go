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
	err = db.CreateTables()
	if err != nil {
		zap.L().Debug(err.Error())
	}
	db.AddUser("as", "as", "as", "as")
}

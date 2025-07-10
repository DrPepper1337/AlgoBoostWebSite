package main

import (
	"AlgoBoostWebSite/internal/config"
	"AlgoBoostWebSite/internal/services/solver"
	"github.com/joho/godotenv"
)

func main() {
	config.InitLogger(true)
	if err := godotenv.Load("./configs/.env"); err != nil {
		panic(err)
	}
	serv := solver.NewSolver()
	serv.Run()

}

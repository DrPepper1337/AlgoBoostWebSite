package main

import (
	"AlgoBoostWebSite/internal/config"
	"AlgoBoostWebSite/internal/services/solver"
)

func main() {
	config.InitLogger(true)
	serv := solver.NewSolver()
	serv.Run()

}

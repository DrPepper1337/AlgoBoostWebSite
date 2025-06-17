package solver

import (
	"AlgoBoostWebSite/internal/database"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

type Solver struct {
	db *database.Database
}

func NewSolver() *Solver {
	db, err := database.NewDatabase()
	if err != nil {
		zap.L().Fatal("Failed to connect to database", zap.Error(err))
		panic(err)
	}
	err = db.CreateTables()
	if err != nil {
		zap.L().Fatal("Failed to create tables", zap.Error(err))
		panic(err)
	}
	return &Solver{db: db}
}

func (s *Solver) Run() {
	for {
		//TODO: add kafka consumer

	}
}

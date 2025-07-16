package solver

import (
	"AlgoBoostWebSite/internal/database"
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
	//for {
	//	zap.L().Info("Starting solver")
	//}
	zap.L().Info("Starting solver")
	////TODO: add kafka consumer
	////RECIEVED solution in form: id, compiler, code, memory, time, statusCode, taskID, userID, status
	////I expect that Nastya has already uploaded task to the database and here i will only solve it and update status
	//compiler := "python"
	//code := "print(1)"
	//taskID := 3
	//userID := 5
	//s.CheckSubmission(1, compiler, code, taskID, userID)
}

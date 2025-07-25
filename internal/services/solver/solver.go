package solver

import (
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
	"os"
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
	zap.L().Info("Starting solver")
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   []string{os.Getenv("KAFKA_BROKER")},
		Topic:     os.Getenv("KAFKA_SUBMISSION_TOPIC"),
		Partition: 0,
		MaxBytes:  10e6,
	})
	for {
		m, err := r.ReadMessage(context.Background())
		if err != nil {
			zap.L().Info(err.Error())
			break
		}
		fmt.Printf("message at offset %d: %s = %s\n", m.Offset, string(m.Key), string(m.Value))
		var res models.Solution
		err = json.Unmarshal(m.Value, &res)
		if err != nil {
			zap.L().Error(err.Error())
		}
		err = s.CheckSubmission(&res)
		if err != nil {
			zap.L().Error(err.Error())
		}

	}
	////RECIEVED solution in form: id, compiler, code, memory, time, statusCode, taskID, userID, status
	////I expect that Nastya has already uploaded task to the database and here i will only solve it and update status
	//compiler := "python"
	//code := "print(1)"
	//taskID := 3
	//userID := 5
	//s.CheckSubmission(1, compiler, code, taskID, userID)
}

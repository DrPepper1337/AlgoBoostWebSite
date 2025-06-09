package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"
	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
)

func (db *Database) AddSolution(compiler, code string, time float64, memory float64, userId int, taskId int) (int, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("solutions").Columns("compiler", "code", "time", "memory", "statusCode", "userId", "task_id").Values(compiler, code, time, memory, "waiting", userId, taskId).Suffix("RETURNING id").ToSql()
	if err != nil {
		return 0, err
	}
	var result interface{}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	err = row.Scan(&result)
	if err != nil {
		return 0, errors.New("solution already exists")
	}
	if _, ok := result.(error); ok {
		return 0, errors.New("adding solution failed")
	}
	return int(result.(int32)), nil
}

func (db *Database) UpdateSolution(id int, statusCode string, time float64, memory float64, status models.Status) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("statuses").Columns("solution_id", "num_of_test", "test_input", "test_output", "user_output").Values(id, status.NumOfTest, status.TestInput, status.TestOutput, status.UserOutput).Suffix("RETURNING id").ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("inserting status failed")
	}
	sql, args, err = psql.Update("solutions").Set("status_code", statusCode).Set("time", time).Set("memory", memory).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	row = db.Postgres.QueryRow(context.Background(), sql, args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("updating solution failed")
	}
	return nil
}

func (db *Database) GetSolution(id int) (models.Solution, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "compiler", "code", "memory", "time", "status_code", "task_id", "user_id").From("solutions").Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return models.Solution{}, err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var result models.Solution
	err = row.Scan(&result.Compiler, &result.Code, &result.Memory, &result.Time, &result.StatusCode, &result.TaskID, &result.UserID)
	if err != nil {
		return models.Solution{}, err
	}
	sql, args, err = psql.Select("id", "solution_id", "num_of_test", "test_input", "test_output", "user_output").From("statuses").Where(sq.Eq{"solution_id": result.ID}).ToSql()
	if err != nil {
		return models.Solution{}, err
	}
	row = db.Postgres.QueryRow(context.Background(), sql, args...)
	var status models.Status
	err = row.Scan(&status.NumOfTest, &status.TestInput, &status.TestOutput, &status.UserOutput)
	if err != nil {
		return models.Solution{}, err
	}
	result.Status = status
	return result, nil
}

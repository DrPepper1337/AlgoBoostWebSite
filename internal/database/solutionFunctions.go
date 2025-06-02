package database

import (
	"context"
	"errors"
	sq "github.com/Masterminds/squirrel"
)

func (db *Database) AddSolution(compiler, code string, time float64, memory float64) (int, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("solutions").Columns("compiler", "code", "time", "memory", "statusCode").Values(compiler, code, time, memory, "waiting").Suffix("RETURNING id").ToSql()
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

func (db *Database) EditSolution(id int, name string, email string, password string, role string) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Update("solutions").Set("name", name).Set("email", email).Set("password", password).Set("role", role).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var result interface{}
	err = row.Scan(&result)
	return nil
}

//

//func (db *Database) GetTask(id int) (models.Task, error) {
//	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
//	sql, args, err := psql.Select("id", "title", "description", "time_limit", "memory_limit", "is_practice").From("tasks").Where(sq.Eq{"id": id}).ToSql()
//	if err != nil {
//		return models.Task{}, err
//	}
//	row := db.Postgres.QueryRow(context.Background(), sql, args...)
//	var result models.Task
//	err = row.Scan(&result.ID, &result.Title, &result.Description, &result.TimeLimit, &result.MemoryLimit, &result.IsPractice)
//	if err != nil {
//		return models.Task{}, err
//	}
//	return result, nil
//}

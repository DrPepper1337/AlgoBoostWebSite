package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"
	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
)

func (db *Database) AddSolution(compiler, code string, userId int, taskId int) (int, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("solutions").Columns("compiler", "code", "status_code", "task_id", "user_id").Values(compiler, code, 1, taskId, userId).Suffix("RETURNING id").ToSql()
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

func (db *Database) UpdateSolution(id int, statusCode int, time float64, memory float64, status models.Status) error {
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

func (db *Database) GetSolutionsByUserID(userID int) ([]models.Solution, error) {
    psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
    sql, args, err := psql.Select("id", "compiler", "code", "COALESCE(memory, 0)", "COALESCE(time, 0)", "status_code", "task_id", "user_id").
        From("solutions").
        Where(sq.Eq{"user_id": userID}).
        Where(sq.NotEq{"code": ""}).
        ToSql()
    if err != nil {
        return nil, err
    }

    rows, err := db.Postgres.Query(context.Background(), sql, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var solutions []models.Solution
    for rows.Next() {
        var s models.Solution
        err = rows.Scan(&s.ID, &s.Compiler, &s.Code, &s.Memory, &s.Time, &s.StatusCode, &s.TaskID, &s.UserID)
        if err != nil {
            return nil, err
        }
        solutions = append(solutions, s)
    }
    return solutions, nil
}

// returns the number of solved practice tasks 
func (db *Database) GetSolvedUserTasks(userID int) (solved int, err error) {
    psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
    
    // Count solved (status_code = 0) for this user - unique tasks only
    sql, args, err := psql.Select("COUNT(DISTINCT task_id)").
        From("solutions").
        Where(sq.Eq{"user_id": userID, "status_code": 0}).
        ToSql()
    if err != nil {
        return 0, err
    }
    err = db.Postgres.QueryRow(context.Background(), sql, args...).Scan(&solved)
    if err != nil {
        return 0, err
    }

    return solved, nil
}

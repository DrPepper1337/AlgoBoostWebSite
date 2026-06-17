package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	pgx "github.com/jackc/pgx/v5"
)

func (db *Database) AddTask(title, description string, timeLimit float64, memoryLimit float64, isPractice bool) (int, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("tasks").Columns("title", "description", "time_limit", "memory_limit", "is_practice").Values(title, description, timeLimit, memoryLimit, isPractice).Suffix("RETURNING id").ToSql()
	if err != nil {
		return 0, err
	}
	var result interface{}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	err = row.Scan(&result)
	if err != nil {
		return 0, errors.New("task already exists")
	}
	if _, ok := result.(error); ok {
		return 0, errors.New("adding task failed")
	}
	return int(result.(int32)), nil
}

func (db *Database) DeleteTask(id int) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Delete("tasks").Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("deleting task failed")
	}
	// delete from lessons_tasks too
	sql2, args2, err := psql.Delete("lessons_tasks").Where(sq.Eq{"task_id": id}).ToSql()
	if err != nil {
		return err
	}
	row = db.Postgres.QueryRow(context.Background(), sql2, args2...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("deleting task from lessons_tasks failed")
	}
	return nil
}

func (db *Database) EditTask(id int, title, description string, timeLimit float64, memoryLimit float64, isPractice bool) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Update("tasks").Set("title", title).Set("description", description).Set("time_limit", timeLimit).Set("memory_limit", memoryLimit).Set("is_practice", isPractice).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	result, err := db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (db *Database) GetTask(id int) (models.Task, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "title", "description", "time_limit", "memory_limit", "is_practice").From("tasks").Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return models.Task{}, err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var result models.Task
	err = row.Scan(&result.ID, &result.Title, &result.Description, &result.TimeLimit, &result.MemoryLimit, &result.IsPractice)
	if err != nil {
		return models.Task{}, err
	}
	return result, nil
}

func (db *Database) GetTasksByLessonIdHandler(lessonID int) ([]models.Task, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("t.id", "t.title", "t.description", "t.time_limit", "t.memory_limit", "t.is_practice").
		From("tasks t").
		Join("lessons_tasks lt ON t.id = lt.task_id").
		Where(sq.Eq{"lt.lesson_id": lessonID}).
		OrderBy("t.id").ToSql()
	if err != nil {
		return nil, err
	}
	rows, err := db.Postgres.Query(context.Background(), sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		err = rows.Scan(&task.ID, &task.Title, &task.Description, &task.TimeLimit, &task.MemoryLimit, &task.IsPractice)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	return tasks, nil
}

func (db *Database) GetTotalNumPracticeTasks() (int, error) {
    psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
    
    // Count total practice tasks
    sql, args, err := psql.Select("COUNT(*)").
        From("tasks").
        Where(sq.Eq{"is_practice": true}).
        ToSql()
    if err != nil {
        return 0, err
    }
    
    var total int
    err = db.Postgres.QueryRow(context.Background(), sql, args...).Scan(&total)
    if err != nil {
        return 0, err
    }

    return total, nil
}
package database

import (
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
)

func (db *Database) AddLesson(title string, description string) (int, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("lessons").Columns("title", "description", "open").Values(title, description, false).Suffix("RETURNING id").ToSql()
	if err != nil {
		return 0, err
	}
	var result interface{}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	err = row.Scan(&result)
	if err != nil {
		return 0, errors.New("lesson already exists")
	}
	if _, ok := result.(error); ok {
		return 0, errors.New("adding lesson failed")
	}
	return int(result.(int32)), nil
}

func (db *Database) AddTaskToLesson(taskId, lessonId int) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("lessons_tasks").Columns("lesson_id", "task_id").Values(taskId, lessonId).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("adding task to a lesson failed")
	}
	return nil
}

func (db *Database) DeleteTaskFromLesson(lessonId, taskId int) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Delete("lessons_tasks").Where(sq.Eq{"lesson_id": lessonId, "task_id": taskId}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("deleting task from lesson failed")
	}
	return nil
}

func (db *Database) DeleteLesson(lessonId int) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql1, args1, err := psql.Delete("lessons_tasks").Where(sq.Eq{"lesson_id": lessonId}).ToSql()
	if err != nil {
		return err
	}
	sql2, args2, err := psql.Delete("lessons").Where(sq.Eq{"id": lessonId}).ToSql()
	if err != nil {
		return err
	}
	args := append(args1, args2...)
	row := db.Postgres.QueryRow(context.Background(), sql1+";"+sql2, args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("deleting lesson failed")
	}
	return nil
}

func (db *Database) EditLesson(id int, title, description string) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Update("lessons").Set("title", title).Set("description", description).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var result interface{}
	err = row.Scan(&result)
	return nil
}

func (db *Database) SetLessonVisuability(id int, open bool) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Update("lessons").Set("open", open).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var result interface{}
	err = row.Scan(&result)
	return nil
}

// func (db *Database) GetLesson(id int) (models.User, error) {
// 	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
// 	sql, args, err := psql.Select("id", "name", "email", "password", "role").From("users").Where(sq.Eq{"id": id}).ToSql()
// 	if err != nil {
// 		return models.User{}, err
// 	}
// 	row := db.Postgres.QueryRow(context.Background(), sql, args...)
// 	var result models.User
// 	err = row.Scan(&result.ID, &result.Name, &result.Email, &result.Password, &result.Role)
// 	return result, nil
// }

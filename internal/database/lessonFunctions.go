package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"
	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"go.uber.org/zap"
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
	sql, args, err := psql.Insert("lessons_tasks").Columns("lesson_id", "task_id").Values(lessonId, taskId).ToSql()
	if err != nil {

		return err
	}
	_, err = db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return err
	}
	return nil
}

func (db *Database) DeleteTaskFromLesson(taskId, lessonId int) error {
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
	_, err = db.Postgres.Exec(context.Background(), sql1, args1...)
	if err != nil {
		return err
	}
	_, err = db.Postgres.Exec(context.Background(), sql2, args2...)
	if err != nil {
		return err
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

func (db *Database) SetLessonVisability(id int, open bool) error {
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

func (db *Database) GetLesson(id int) (models.Lesson, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.
		Select(
			"l.id",
			"l.title",
			"l.description",
			"l.open",
			"COALESCE(json_agg(json_build_object("+
				"'id', tasks.id, "+
				"'title', tasks.title "+
				")) FILTER (WHERE tasks.id IS NOT NULL), '[]') AS tasks").
		From("lessons l").
		LeftJoin("lessons_tasks ON l.id = lessons_tasks.lesson_id").
		LeftJoin("tasks ON tasks.id = lessons_tasks.task_id").
		Where(sq.Eq{"l.id": id}).
		GroupBy("l.id", "l.title", "l.description", "l.open").
		ToSql()
	zap.L().Info("sql", zap.String("sql", sql))
	if err != nil {
		return models.Lesson{}, err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var result models.Lesson
	err = row.Scan(&result.ID, &result.Title, &result.Description, &result.Open, &result.Tasks)
	if err != nil {
		return models.Lesson{}, err
	}
	zap.L().Info("result", zap.Any("result", result))
	return result, nil
}

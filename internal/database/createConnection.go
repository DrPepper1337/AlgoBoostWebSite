package database

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

func NewPostgresQLConnection() (*pgxpool.Pool, error) {
	url := "postgresql://" +
		os.Getenv("POSTGRES_USER") + ":" +
		os.Getenv("POSTGRES_PASSWORD") + "@" +
		os.Getenv("POSTGRES_HOST") + ":" +
		os.Getenv("POSTGRES_PORT") + "/" +
		os.Getenv("POSTGRES_DB")
	pool, err := pgxpool.New(context.Background(), url)
	// TODO: configure connection pool in the future taking the amount of services from env
	if err != nil {
		return nil, err
	}
	zap.L().Info("connected to postgresql")
	return pool, nil
}

func (db *Database) CreateTables() error {
	query := `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name varchar(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password TEXT NOT NULL,
			role TEXT NOT NULL
	    );`
	_, err := db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to create users table", zap.Error(err))
		return err
	}
	query = `
		CREATE TABLE IF NOT EXISTS lessons (
			id SERIAL PRIMARY KEY,
			title varchar(255) NOT NULL,
			description TEXT NOT NULL,
			open BOOLEAN NOT NULL
	    );`
	_, err = db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to create lesons table", zap.Error(err))
		return err
	}
	query = `
		CREATE TABLE IF NOT EXISTS tasks (
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			time_limit NUMERIC(10, 3) NOT NULL,
			memory_limit NUMERIC(10, 3) NOT NULL,
			is_practice BOOLEAN NOT NULL
		);`
	_, err = db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to create tasks table", zap.Error(err))
		return err
	}

	query = `
		CREATE TABLE IF NOT EXISTS statuses (
			id SERIAL PRIMARY KEY,
			solution_id INTEGER NOT NULL,
			num_of_test INTEGER NOT NULL,
			test_input TEXT NOT NULL,
			test_output TEXT NOT NULL,
			user_output TEXT NOT NULL,
			FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE
		);`
	_, err = db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to create statuses table", zap.Error(err))
		return err
	}

	query = `
		CREATE TABLE IF NOT EXISTS solutions (
			id SERIAL PRIMARY KEY,
			compiler VARCHAR(50) NOT NULL,
			code TEXT NOT NULL,
			time NUMERIC(10, 3),
			memory NUMERIC(10, 3),
			status_code VARCHAR(20) NOT NULL,
    		task_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
		);`
	_, err = db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to create solutions table", zap.Error(err))
		return err
	}

	query = `
		CREATE TABLE IF NOT EXISTS lessons_tasks (
			lesson_id INTEGER NOT NULL,
    		task_id INTEGER NOT NULL,
    		PRIMARY KEY (lesson_id, task_id),
			FOREIGN KEY (lesson_id) REFERENCES lessons(id),
			FOREIGN KEY (task_id) REFERENCES tasks(id)
		);`
	_, err = db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to create lessons_tasks table", zap.Error(err))
		return err
	}

	zap.L().Info("All postgres tables created successfully")
	return nil
}

func (db *Database) DropTables() error {
	query := `
		DROP TABLE IF EXISTS solutions;
		DROP TABLE IF EXISTS lessons_tasks;
		DROP TABLE IF EXISTS tasks;
		DROP TABLE IF EXISTS users;
		DROP TABLE IF EXISTS statuses;
		DROP TABLE IF EXISTS lessons;
		`
	_, err := db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to drop tables", zap.Error(err))
		return err
	}
	zap.L().Info("All postgres tables dropped successfully")
	return nil
}

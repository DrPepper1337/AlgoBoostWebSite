package database

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
	"os"
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
		CREATE TABLE IF NOT EXISTS tasks (
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			time_limit INT NOT NULL,
			memory_limit INT NOT NULL,
			description TEXT NOT NULL,
			tests TEXT NOT NULL
		);`
	_, err = db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to create tasks table", zap.Error(err))
		return err
	}
	zap.L().Info("All postgres tables created successfully")
	return nil
}

func (db *Database) DropTables() error {
	query := `
		DROP TABLE IF EXISTS tasks;
		DROP TABLE IF EXISTS users;`
	_, err := db.Postgres.Exec(context.Background(), query)
	if err != nil {
		zap.L().Error("failed to drop tables", zap.Error(err))
		return err
	}
	zap.L().Info("All postgres tables dropped successfully")
	return nil
}

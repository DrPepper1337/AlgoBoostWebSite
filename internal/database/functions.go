package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"strings"
)

type Database struct {
	Postgres *pgxpool.Pool
}

func NewDatabase() (*Database, error) {
	pool, err := NewPostgresQLConnection()
	if err != nil {
		return nil, err
	}
	return &Database{
		Postgres: pool,
	}, nil
}
func (db *Database) Close() {
	db.Postgres.Close()
}

func replacePlaceholder(sql string) string {
	var result strings.Builder
	counter := 1
	for _, r := range sql {
		if r == '?' {
			result.WriteString(fmt.Sprintf("$%d", counter))
			counter++
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}

func (db *Database) AddUser(name string, email string, password string, role string) (int, error) {
	sql, args, err := sq.Insert("users").Columns("name", "email", "password", "role").Values(name, email, password, role).Suffix("RETURNING id").ToSql()
	if err != nil {
		return 0, err
	}
	var result interface{}
	row := db.Postgres.QueryRow(context.Background(), replacePlaceholder(sql), args...)
	err = row.Scan(&result)
	if err != nil {
		return 0, errors.New("user already exists")
	}
	if _, ok := result.(error); ok {
		return 0, errors.New("adding user failed")
	}
	return int(result.(int32)), nil
}

func (db *Database) DeleteUser(id int) error {
	sql, args, err := sq.Delete("users").Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), replacePlaceholder(sql), args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("deleting user failed")
	}
	return nil
}

func (db *Database) EditUser(id int, name string, email string, password string, role string) error {
	sql, args, err := sq.Update("users").Set("name", name).Set("email", email).Set("password", password).Set("role", role).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), replacePlaceholder(sql), args...)
	var result interface{}
	err = row.Scan(&result)
	return nil
}

func (db *Database) GetUser(id int) (models.User, error) {
	sql, args, err := sq.Select("id", "name", "email", "password", "role").From("users").Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return models.User{}, err
	}
	row := db.Postgres.QueryRow(context.Background(), replacePlaceholder(sql), args...)
	var result models.User
	err = row.Scan(&result.ID, &result.Name, &result.Email, &result.Password, &result.Role)
	return result, nil
}

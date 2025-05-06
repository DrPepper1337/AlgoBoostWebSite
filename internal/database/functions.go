package database

import (
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
	pgxpool, err := NewPostgresQLConnection()
	if err != nil {
		return nil, err
	}
	return &Database{
		Postgres: pgxpool,
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

func (db *Database) AddUser(email string, password string, role string) (int, error) {
	sql, args, err := sq.Insert("users").Columns("email", "password", "role").Values(email, password, role).Suffix("RETURNING id").ToSql()
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

//
//func EditUser(conn *pgx.Conn, id int, email string, password string, role string) error {
//
//}

//
//func GetUser(conn *pgx.Conn, id int) (models.User, error) {
//
//}

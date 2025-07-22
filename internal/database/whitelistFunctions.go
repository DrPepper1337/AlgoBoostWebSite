package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
)

func (db *Database) AddEmailToWhitelist(email, name, role string) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("whitelist").Columns("email", "name", "role").Values(email, name, role).ToSql()
	if err != nil {
		return err
	}
	_, err = db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return errors.New("adding email to whitelist failed")
	}
	return nil
}

func (db *Database) IsEmailWhitelisted(email string) (models.Whitelist, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "email", "name", "role").From("whitelist").Where(sq.Eq{"email": email}).ToSql()
	if err != nil {
		return models.Whitelist{}, err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var w models.Whitelist
	err = row.Scan(&w.ID, &w.Email, &w.Name, &w.Role)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Whitelist{}, errors.New("email not found in whitelist")
		}
		return models.Whitelist{}, err
	}
	return w, nil
}

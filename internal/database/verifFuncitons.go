package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"
	"time"

	sq "github.com/Masterminds/squirrel"
	pgx "github.com/jackc/pgx/v5"
)

func (db *Database) GetValidRegistrationEntry(token string) (models.RegistrationEntry, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "email", "password", "name", "role", "token", "token_type", "expiration").
		From("awaiting_verification").Where(sq.Eq{"token": token}).ToSql()
	if err != nil {
		return models.RegistrationEntry{}, err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var entry models.RegistrationEntry
	err = row.Scan(&entry.ID, &entry.Email, &entry.Password, &entry.Name, &entry.Role, &entry.Token, &entry.TokenType, &entry.ExpiresAt)
	if err != nil {
		return models.RegistrationEntry{}, err
	}
	if entry.ExpiresAt.Before(time.Now()) {
		return models.RegistrationEntry{}, errors.New("registration entry has expired")
	}
	if entry.Used {
		return models.RegistrationEntry{}, errors.New("registration entry has already been used")
	}
	return entry, nil
}

func (db *Database) AddVerificationEntry(email, password, name, role, token, tokenType, expiration string) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("awaiting_verification").Columns("email", "password", "name", "role", "token", "token_type", "expiration").
		Values(email, password, name, role, token, tokenType, expiration).ToSql()
	if err != nil {
		return err
	}
	_, err = db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return errors.New("adding registration entry failed")
	}
	return nil
}

func (db *Database) MarkTokenAsUsed(token string) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Update("awaiting_verification").Set("used", true).Where(sq.Eq{"token": token}).ToSql()
	if err != nil {
		return err
	}
	_, err = db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return errors.New("marking token as used failed")
	}
	return nil
}

func (db *Database) DeleteVerificationEntry(token string) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Delete("awaiting_verification").Where(sq.Eq{"token": token}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("deleting verification entry failed")
	}
	return nil
}

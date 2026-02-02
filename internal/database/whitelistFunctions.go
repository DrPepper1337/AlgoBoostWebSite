package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	pgx "github.com/jackc/pgx/v5"
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

func (db *Database) GetUserEmailByID(userID int) (string, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("email").From("users").Where(sq.Eq{"id": userID}).ToSql()
	if err != nil {
		return "", err
	}

	var email string
	err = db.Postgres.QueryRow(context.Background(), sql, args...).Scan(&email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", errors.New("user not found")
		}
		return "", err
	}

	return email, nil
}

func (db *Database) DeleteEmailFromWhitelist(id int) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Delete("whitelist").Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	cmdTag, err := db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return errors.New("deleting email from whitelist failed")
	}
	if cmdTag.RowsAffected() == 0 {
		return errors.New("email not found in whitelist")
	}
	return nil
}

func (db *Database) GetWhitelist() ([]models.Whitelist, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "email", "name", "role").From("whitelist").ToSql()
	if err != nil {
		return nil, err
	}
	rows, err := db.Postgres.Query(context.Background(), sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var whitelist []models.Whitelist
	for rows.Next() {
		var w models.Whitelist
		err := rows.Scan(&w.ID, &w.Email, &w.Name, &w.Role)
		if err != nil {
			return nil, err
		}
		whitelist = append(whitelist, w)
	}
	if rows.Err() != nil {
		return nil, rows.Err()
	}
	return whitelist, nil
}

func (db *Database) EditWhitelist(id int, property string, value interface{}) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Update("whitelist").Set(property, value).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}

	result, err := db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return err
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("no rows updated - whitelist entry may not exist")
	}

	return nil
}

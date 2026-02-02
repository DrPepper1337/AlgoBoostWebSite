package database

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	pgx "github.com/jackc/pgx/v5"
)

func (db *Database) AddUser(name string, email string, password string, role string) (int, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Insert("users").Columns("name", "email", "password", "role").Values(name, email, password, role).Suffix("RETURNING id").ToSql()
	if err != nil {
		return 0, err
	}
	var result interface{}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
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
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Delete("users").Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	if !errors.Is(row.Scan(), pgx.ErrNoRows) {
		return errors.New("deleting user failed")
	}
	return nil
}

func (db *Database) EditUser(id int, property string, value interface{}) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Update("users").Set(property, value).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}

	result, err := db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return err
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("no rows updated - user may not exist")
	}

	return nil
}

func (db *Database) UpdateUserPassword(id int, newPassword string) error {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Update("users").Set("password", newPassword).Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return err
	}

	result, err := db.Postgres.Exec(context.Background(), sql, args...)
	if err != nil {
		return err
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("no rows updated - user may not exist")
	}

	return nil
}

func (db *Database) GetUser(id int) (models.User, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "name", "email", "password", "role").From("users").Where(sq.Eq{"id": id}).ToSql()
	if err != nil {
		return models.User{}, err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var result models.User
	err = row.Scan(&result.ID, &result.Name, &result.Email, &result.Password, &result.Role)
	if err != nil {
		return models.User{}, err
	}
	return result, nil
}

func (db *Database) GetUserByEmail(email string) (models.User, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "name", "email", "password", "role").From("users").Where(sq.Eq{"email": email}).ToSql()
	if err != nil {
		return models.User{}, err
	}
	row := db.Postgres.QueryRow(context.Background(), sql, args...)
	var result models.User
	err = row.Scan(&result.ID, &result.Name, &result.Email, &result.Password, &result.Role)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.User{}, nil
	}
	return result, err
}

func (db *Database) LoginUser(email, password string) (models.User, error) {
	user, err := db.GetUserByEmail(email)
	if err != nil {
		return models.User{}, err
	}

	if user.Password != password {
		return models.User{}, errors.New("invalid credentials")
	}

	return user, nil

}

func (db *Database) GetMembers() ([]models.User, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "name", "email", "role").From("users").Where(sq.Eq{"role": "member"}).ToSql()
	if err != nil {
		return nil, err
	}
	rows, err := db.Postgres.Query(context.Background(), sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.Role)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return users, nil
}

func (db *Database) GetAdmins() ([]models.User, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	sql, args, err := psql.Select("id", "name", "email", "role").From("users").Where(sq.Eq{"role": "admin"}).ToSql()
	if err != nil {
		return nil, err
	}
	rows, err := db.Postgres.Query(context.Background(), sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.Role)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return users, nil
}

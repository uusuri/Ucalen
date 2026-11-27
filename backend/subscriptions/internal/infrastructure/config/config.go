package config

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetConnectionPoolConfig(url string) (*pgxpool.Config, error) {
	return pgxpool.ParseConfig(url)
}

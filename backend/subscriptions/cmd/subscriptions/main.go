package subscriptions

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/uusuri/Ucalen/backend/subscriptions/internal/infrastructure/config"
	"github.com/uusuri/Ucalen/backend/subscriptions/internal/infrastructure/database"
	"github.com/xlab/closer"
)

func main() {
	defer closer.Close()
	closer.Bind(cleanup)
	config, err := config.GetConnectionPoolConfig(os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Println("Отсутствует переменная окружения DATABASE_URL в файле .env")
	}
	pool, err := database.NewPostgres(context.Background(), config.ConnString())
	closer.Bind(pool.Close)
	pool.Ping(context.Background())
	closer.Close()
}

func cleanup() {
	fmt.Println("Hang on, bitch! Now I have to clean up all of your's shit!")
	time.Sleep(3 * time.Second)
	fmt.Println("Done, fucker")
}

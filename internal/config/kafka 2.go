package config

import (
	"os"
)

var KafkaBrokers = []string{os.Getenv("KAFKA_ADVERTISED_LISTENERS")}
var KafkaTopic = "submissions"

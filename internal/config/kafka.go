package config

import (
	"os"
)

var KafkaBrokers = []string{os.Getenv("KAFKA_BROKER")}
var KafkaTopic = os.Getenv("KAFKA_SUBMISSION_TOPIC")

package receiver

import(
	"encoding/json"
	"net/http"
	"log"

	kafka "github.com/segmentio/kafka-go"
	"context"
)

type SubmitRequest struct {
	Code string `json:"code"`
	TaskID string `json:"task_id"`
	UserID string `json:"user_id`
}

var kafkaWriter *kafka.Writer = kafka.NewWriter(kafka.WriteConfig{
	Brokers: []string{"localhost:9092"},
	Topic: "submissons",
})

func SubmitHandler(w http.ResponseWriter , r *http.Request) {
	var req SubmitRequest
	err := json.newDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// serialise as json to end to kafka
	value, _ := json.Marshal(req)

	err = kafkaWriter.WriterMessages(contextBackground(), kafka.Message{
		Key: []byte(req.UserID)
		Value:  value,
	}
	if err != nil {
		http.Error(w, "failed to submit code", http.StatusInternalServerError)
		return
	}

	log.Println("code submitted to Kafka for task", req.TaskID)
	w.Write([]byte(`{"status": "submitted"}`))
}
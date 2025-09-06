FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY ./go.mod ./go.sum ./

RUN go mod download

COPY . .

RUN go build -o /receiver ./cmd/receiver/main.go

FROM alpine:latest

COPY --from=builder /receiver /receiver

CMD ["/receiver"]

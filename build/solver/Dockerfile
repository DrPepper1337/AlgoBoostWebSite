FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY ./go.mod ./go.sum ./

RUN go mod download

COPY . .

RUN go build -o /solver ./cmd/solver/main.go

FROM alpine:latest

COPY --from=builder /solver /solver

CMD ["/solver"]


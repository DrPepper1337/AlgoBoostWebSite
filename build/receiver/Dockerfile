FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --update \
    curl \
    && rm -rf /var/cache/apk/* \
    
COPY ./go.mod ./go.sum ./

RUN go mod download

COPY . .

RUN go build -o /receiver ./cmd/receiver/main.go

FROM alpine:latest

COPY --from=builder /receiver /receiver

CMD ["/receiver"]

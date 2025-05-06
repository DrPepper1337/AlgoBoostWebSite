package models

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Task struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	TimeLimit   int    `json:"time_limit"`
	MemoryLimit int    `json:"memory_limit"`
	Description string `json:"description"`
	Tests       string `json:"tests"`
}

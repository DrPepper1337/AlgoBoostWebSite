package models

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Task struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"Description"`
	TimeLimit   float64 `json:"time_limit"`
	MemoryLimit string  `json:"memory_limit"`
	IsPractice  bool    `json:"is_practice"`
}

type ShortTask struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Status int    `json:"status"`
}

type Lesson struct {
	ID          int         `json:"id"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Open        bool        `json:"open"`
	Tasks       []ShortTask `json:"tasks"`
}

type Solution struct {
	ID         int     `json:"id"`
	Compiler   string  `json:"compiler"`
	Code       string  `json:"code"`
	Memory     string  `json:"memory"`
	Time       float64 `json:"time"`
	StatusCode string  `json:"status_code"`
	StatusID   int     `json:"status_id"`
	TaskID     int     `json:"task_id"`
}

type Status struct {
	ID         int    `json:"id"`
	NumOfTest  int    `json:"num_of_test"`
	TestInput  string `json:"test_input"`
	TestOutput string `json:"test_output"`
	UserOutput string `json:"user_output"`
}

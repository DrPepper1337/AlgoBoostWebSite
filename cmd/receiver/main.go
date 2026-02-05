package main

import (
	"AlgoBoostWebSite/internal/config"
	"AlgoBoostWebSite/internal/database"
	"AlgoBoostWebSite/internal/services/receiver"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"log"
	"net/http"
)

func main() {
	config.InitLogger(true)
	db, err := database.NewDatabase()
	if err != nil {
		zap.L().Debug(err.Error())
	}
	err = db.DropTables()
	if err != nil {
		zap.L().Debug(err.Error())
	}
	err = db.CreateTables()
	if err != nil {
		zap.L().Debug(err.Error())
	}
	// Add Lesson 1: Dynamic Programming
	dpLessonID, err := db.AddLesson("Dynamic Programming", "hop hey lalalei")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	// thoery Task
	definitionID, err := db.AddTask("What is Dynamic Programming?", "Defition...", 0, 0, false)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	if err := db.AddTaskToLesson(definitionID, dpLessonID); err != nil {
		zap.L().Debug(err.Error())
	}

	// practice Task 1
	fibID, err := db.AddTask("Fibonacci", "Compute the nth Fibonacci number using memoization.", 10, 250, true)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	if err := db.AddTaskToLesson(fibID, dpLessonID); err != nil {
		zap.L().Debug(err.Error())
	}

	// practice Task 2
	knapsackID, err := db.AddTask("0/1 Knapsack", "Given weights and values, determine max value under capacity limit.", 10, 250, true)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	if err := db.AddTaskToLesson(knapsackID, dpLessonID); err != nil {
		zap.L().Debug(err.Error())
	}

	// checking
	result, err := db.GetLesson(dpLessonID)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	zap.L().Debug("a", zap.Any("ads", result.Tasks))

	// Add Lesson 2: Linked Lists
	llLessonID, err := db.AddLesson("Linked Lists", "Explore operations like insertion, deletion, and traversal in singly and doubly linked lists.")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	// Add Task 1 to Linked Lists
	reverseID, err := db.AddTask("Reverse Linked List", "Reverse a singly linked list in-place.", 10, 250, true)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	if err := db.AddTaskToLesson(reverseID, llLessonID); err != nil {
		zap.L().Debug(err.Error())
	}

	// Add Task 2 to Linked Lists
	detectCycleID, err := db.AddTask("Detect Cycle", "Check if a linked list contains a cycle using Floyd’s algorithm.", 10, 250, true)
	if err != nil {
		zap.L().Debug(err.Error())
	}
	if err := db.AddTaskToLesson(detectCycleID, llLessonID); err != nil {
		zap.L().Debug(err.Error())
	}

	// Set lessons visible
	if err := db.SetLessonVisability(dpLessonID, true); err != nil {
		zap.L().Debug(err.Error())
	}
	if err := db.SetLessonVisability(llLessonID, true); err != nil {
		zap.L().Debug(err.Error())
	}

	// _, err = db.AddUser("test", "test@gmail.com", "test123", "admin")
	// if err != nil {
	// 	zap.L().Debug(err.Error())
	// }
	const password = "test123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return
	}
	_, err = db.AddUser("test admin", "test1@gmail.com", string(hashedPassword), "admin")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	_, err = db.AddUser("test admin", "test2@gmail.com", string(hashedPassword), "member")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	err = db.AddEmailToWhitelist("sofia.morgulchik@gmail.com", "soph", "member")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	err = db.AddEmailToWhitelist("stasymartinson@gmail.com", "aaa", "admin")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	err = db.AddEmailToWhitelist("i@nadezhdafedotova.ru", "Nadezhda", "member")
	if err != nil {
		zap.L().Debug(err.Error())
	}

	   err = db.AddEmailToWhitelist("i@nadezhdafedotova.ru", "Nadezhda", "member")
    if err != nil {
        zap.L().Debug(err.Error())
    }

    // Add test solutions for user ID 1
    _, err = db.AddSolution("python", "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)", 1, 2)
    if err != nil {
        zap.L().Debug(err.Error())
    }

	  _, err = db.AddSolution("python", "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)", 1, 3)
    if err != nil {
        zap.L().Debug(err.Error())
    }

	  _, err = db.AddSolution("python", "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)", 1, 4)
    if err != nil {
        zap.L().Debug(err.Error())
    }


	


	// initialises the receiver
	r := receiver.SetupRoutes(db)
	log.Println("receiver running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))

}

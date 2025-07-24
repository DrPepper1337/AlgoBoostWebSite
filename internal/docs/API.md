# AlgoBoost Backend API Reference

Base URL: `http://localhost:8080/api`

> All routes (except registration & login) require authentication via JWT in the `Authorization` header.

## Table of Contents

- [Login](#login)
- [Register](#register)
- [Verify Email](#email-verification)
- [Lessons](#lessons)
- [Task](#tasks)
- [Password Reset](#password-reset)
- [Admin Endpoints](#admin-endpoints)

---

## Auth & Registration

### Register

Registers a whitelisted user. If user is not whitelisted, you'll get an error response. Sends verification email.

```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

> No user is created until email is verified. After clicking the email verification link (expires in 24h), the user is automatically logged in.

---

### Email Verification

Triggered via email link (auto-submitted POST):

```bash
curl -X POST http://localhost:8080/api/verify?token=<your_token>
```

Returns a valid JWT token in the response.

---

### Login

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@gmail.com", "password": "test123"}'
```

**Returns:**

```json
{ "token": "<jwt_token>" }
```

Use this token for all authenticated requests:

```bash
-H "Authorization: Bearer <jwt_token>"
```

---

## Password Reset

### Request password reset (email + new password)

```bash
curl -X POST http://localhost:8080/api/request-reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "password": "test321"}'
```

A reset link will be emailed. Once clicked:

### Confirm reset (auto-POST)

```bash
curl -X POST http://localhost:8080/api/verify-reset?token=<your_token>
```

Then log in using the new password.

---

## Lessons

### Get All Lessons

```bash
curl http://localhost:8080/api/lessons \
  -H "Authorization: Bearer <jwt_token>"
```

**Returns:**

```json
[
  {
    "id": 1,
    "title": "Sorting",
    "description": "Intro to sorting algorithms",
    "open": true,
    "tasks": [
      { "id": 1, "title": "Quicksort", "status": 0 },
      { "id": 2, "title": "MergeSort", "status": 1 }
    ]
  }
]
```

---

### Get Lesson by ID

```bash
curl http://localhost:8080/api/lessons/{lessonID} \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Tasks

### Get Task Details

```bash
curl http://localhost:8080/api/tasks/{taskID} \
  -H "Authorization: Bearer <jwt_token>"
```

**Returns:**

```json
{
  "id": 1,
  "title": "banana",
  "Description": "task description",
  "time_limit": 10,
  "memory_limit": "250.000",
  "is_practice": true
}
```

---

## Admin Endpoints

> Requires login with an admin role (`Role: "admin"`)

### Add Lesson

```bash
curl -X POST http://localhost:8080/api/admin/add-lesson \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Lesson Name", "description": "test description wablabdabda"}'
```
#### Response
```json
{"lesson_id":2}
```
---
### Add Task to Lesson

```bash
curl -X POST http://localhost:8080/api/admin/add-task-to-lesson \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"task_id": 1, "lesson_id": 1}'
```
#### Response
```json
"task with id 2 added to lesson with id 1 successfully"
```
---
### Delete Task from Lesson

```bash
curl -X POST http://localhost:8080/api/admin/delete-task-from-lesson \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"task_id": 1, "lesson_id": 1}'
```
#### Response
```json
"task with id 1 deleted from lesson with id 1 successfully"
```
---
### Delete Lesson

```bash
curl -X POST http://localhost:8080/api/admin/delete-lesson \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"lesson_id": 1}'
```
```json
```
---

## Notes for Frontend

* JWT tokens are returned after successful verification or login
* Store the token in `localStorage`
* Send the token as a Bearer token in headers for all protected routes
* Handle expiry upon logout on the frontend

---

## Test Users

| Email                                     | Password | Role   |
| ----------------------------------------- | -------- | ------ |
| [test1@gmail.com](mailto:test1@gmail.com) | test123  | admin  |
| [test2@gmail.com](mailto:test2@gmail.com) | test123  | member |

## Test Lessons and tasks

| Task Title | Task ID | linked to lesson  |
| ---------- | ------- | ----------------- |
| Task 1     | 1       | Lesson 1   (DI 1) |
| Task 2     | 2       |                   |

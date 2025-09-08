# AlgoBoost Backend API Reference

Base URL: `http://localhost:8080/api`

> All routes (except registration & login) require authentication via JWT in the `Authorization` header.

## Table of Contents

- [AlgoBoost Backend API Reference](#algoboost-backend-api-reference)
  - [Table of Contents](#table-of-contents)
- [Member Endpints](#member-endpints)
  - [Auth \& Registration](#auth--registration)
    - [Register](#register)
    - [Email Verification](#email-verification)
    - [Login](#login)
  - [Password Reset](#password-reset)
    - [Request password reset (email + new password)](#request-password-reset-email--new-password)
  - [Lessons](#lessons)
    - [Get All Lessons](#get-all-lessons)
  - [Tasks](#tasks)
    - [Get Task Details](#get-task-details)
- [Admin Endpoints](#admin-endpoints)
  - [Lessons \& Tasks](#lessons--tasks)
    - [Add Lesson](#add-lesson)
    - [Add Task to Lesson](#add-task-to-lesson)
    - [Delete Task from Lesson](#delete-task-from-lesson)
    - [Delete Lesson](#delete-lesson)
    - [Add Task](#add-task)
    - [Edit Task](#edit-task)
    - [Delete Task](#delete-task)
  - [Users \& Whitelist](#users--whitelist)
    - [Get All Users](#get-all-users)
    - [Edit User](#edit-user)
    - [Add Email to Whitelist](#add-email-to-whitelist)
    - [Delete Email from Whitelist](#delete-email-from-whitelist)
    - [Delete User](#delete-user)
- [Notes for Frontend](#notes-for-frontend)
- [Test Users](#test-users)
- [Test Lessons and tasks](#test-lessons-and-tasks)

---
# Member Endpints
## Auth & Registration

### Register

Registers a whitelisted user. If user is not whitelisted, you'll get an error response. Sends verification email.

```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@gmail.com", "password": "test123"}'
```

**Response**
```json
{
    "success":true,
    "message":"verification email sent to test1@gmail.com"
}
```

> No user is created until email is verified. After clicking the email verification link (expires in 24h), the user is automatically logged in.

---

### Email Verification

Triggered via email link (auto-submitted GET):

```bash
curl GET http://localhost:8080/api/verify?token=<your_token>
```

**Response**
```json
{
   "success":true,
   "message":"verification successful",
   "data":{
      "role":"member",
      "token":"<jwt_token>",
      "user_id":"3"
   }
}
```
---

### Login

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@gmail.com", "password": "test123"}'
```

**Response**

```json
{
    "success":true,
    "message":"login successful",
    "data":{
        "role":"admin",
        "token":"<jwt_token>",
        "user_id":"1"
    }
}
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
  -d '{"email": "test1@gmail.com", "password": "test321"}'
```

**Response**
```json
{
    "success":true,
    "message":"reset password email sent to test1@gmail.com"
}
```
A reset link will be emailed. Once clicked:

**Confirm reset (auto-GET)**

```bash
curl GET http://localhost:8080/api/verify?token=<your_token>
```

Then log in using the new password.

---

## Lessons

### Get All Lessons

```bash
curl http://localhost:8080/api/lessons \
  -H "Authorization: Bearer <jwt_token>"
```

**Response**

```json
[{
    "success":true,
    "message":"lessons fetched successfully",
    "data":[{
        "id":1,
        "title":"Lesson 1",
        "description":"Description 1",
        "open":true,"
        tasks":[
            {
            "id":1,
            "title":"Task 1",
            "status":0
        }]
    }]
}]
```

---

## Tasks

### Get Task Details

```bash
curl http://localhost:8080/api/tasks/{taskID} \
  -H "Authorization: Bearer <jwt_token>"
```

**Response**

```json
{
   "success":true,
   "message":"task fetched successfully",
   "data":{
      "id":1,
      "title":"Task 1",
      "Description":"decription 1 (linked to lesson 1)",
      "time_limit":10,
      "memory_limit":250,
      "is_practice":true
   }
}
```

---

# Admin Endpoints

> Requires login with an admin role (`Role: "admin"`)

## Lessons & Tasks

### Add Lesson
```bash
curl -X POST http://localhost:8080/api/admin/add-lesson \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Lesson Name", "description": "test description wablabdabda"}'
```

**Response**
```json
{
   "success":true,
   "message":"lesson created successfully",
   "data":{
      "lesson_id":2
   }
}
```
---

### Add Task to Lesson
```bash
curl -X POST http://localhost:8080/api/admin/add-task-to-lesson \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"task_id": 1, "lesson_id": 1}'
```

**Response**
```json
{
   "success":true,
   "message":"task with ID 2 added to lesson with ID 1 successfully"
}
```

---
### Delete Task from Lesson

```bash
curl -X POST http://localhost:8080/api/admin/delete-task-from-lesson \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"task_id": 1, "lesson_id": 1}'
```

**Response**
```json
{
   "success":true,
   "message":"task with id 1 deleted from lesson with id 1 successfully"
}
```
---
### Delete Lesson

```bash
curl -X POST http://localhost:8080/api/admin/delete-lesson \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"lesson_id": 1}'
```

**Response**
```json
{
   "success":true,
   "message":"lesson with id 1 deleted successfully"
}
```
---


### Add Task
```bash
curl -X POST http://localhost:8080/api/admin/add-task \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "test task 3", "description": "task 3 test description", "time_limit": 150, "memory_limit": 50, "is_practice": true}'
```

**Response**
```json
{
   "success":true,
   "message":"task created successfully",
   "data":{
      "task_id":3
   }
}
```

---

### Edit Task

```bash
curl -X POST http://localhost:8080/api/admin/edit-task \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTM0NzUwMjAsInJvbGUiOiJhZG1pbiIsInVzZXJfaWQiOjF9.eMRLLqNxKWNXgOuTU25XIAAYqjTsmZlsJ1HQbivBy-k"  \
  -H "Content-Type: application/json" \
  -d '{"id": 3, "title": "test task 3", "description": "task 3 test description", "time_limit": 150, "memory_limit": 80, "is_practice": true}'
```
(the memory limit was changed)

**Response**
```json
{
   "success":true,
   "message":"task with ID 3 edited successfully"
}
```
---

### Delete Task

```bash
curl -X POST http://localhost:8080/api/admin/delete-task \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"task_id": 3}'
```

**Response**
```json
{
   "success":true,
   "message":"task with ID 3 deleted successfully"
}
```
---
## Users & Whitelist

### Get All Users
```bash
curl -X POST http://localhost:8080/api/admin/get-all-users \
  -H "Authorization: Bearer <jwt_token>"  \
  -H "Content-Type: application/json" \
```
**Response**

```json
[
  {
    "id":1,
    "name":"test",
    "email":"test1@gmail.com",
    "password":"$2a$10$YwzPOIT4j4RIRCZP3sIVUeKzvI5q1Xhw/H85HyV8sngxo.jaCprWS",
    "role":"admin"
  },
  {
    "id":2,
    "name":"test",
    "email":"test2@gmail.com",
    "password":"$2a$10$YwzPOIT4j4RIRCZP3sIVUeKzvI5q1Xhw/H85HyV8sngxo.jaCprWS",
    "role":"member"
  }
]
```
---

### Edit User
```bash
curl -X POST http://localhost:8080/api/admin/edit-user \
  -H "Authorization: Bearer <jwt_token>"  \
  -H "Content-Type: application/json" \
  -d '{"id": 2, "name": "test changed", "password":"$2a$10$YwzPOIT4j4RIRCZP3sIVUeKzvI5q1Xhw/H85HyV8sngxo.jaCprWS", "email":"test2@gmail.com", "role":"member"}'
```
**Response**
```json
{
   "success":true,
   "message":"user with ID 2 edited successfully"
}
```
---
### Add Email to Whitelist
```bash
curl -X POST http://localhost:8080/api/admin/add-email-to-whitelist \
  -H "Authorization: Bearer <jwt_token>"  \
  -H "Content-Type: application/json" \
  -d '{"email":"test3@gmail.com", "name":"Test3", "role":"member"}'
```
**Response**
```json
{
  "success":true,
  "message":"email added whitelis successfully"
}
```
---
### Delete Email from Whitelist
```bash
curl -X POST http://localhost:8080/api/admin/delete-email-from-whitelist \
  -H "Authorization: Bearer <jwt_token>"  \
  -H "Content-Type: application/json" \
  -d '{"email":"test3@gmail.com"}'
```
**Response**
```json
{
  "success":true,
  "message":"user with email test3@gmail.com deleted from whitelist successfully"
}
```
---
### Delete User
```bash
curl -X POST http://localhost:8080/api/admin/delete-user \
  -H "Authorization: Bearer <jwt_token>"  \
  -H "Content-Type: application/json" \
  -d '{"id":2}'
```
**Response**
```json
{
  "success":true,
  "message":"user with ID 2 deleted successfully"
}
```

# Notes for Frontend

* JWT tokens are returned after successful verification or login
* Store the token in `localStorage`
* Send the token as a Bearer token in headers for all protected routes
* Handle expiry upon logout on the frontend

# Test Users

| Email                                     | Password | Role   |
| ----------------------------------------- | -------- | ------ |
| [test1@gmail.com](mailto:test1@gmail.com) | test123  | admin  |
| [test2@gmail.com](mailto:test2@gmail.com) | test123  | member |

# Test Lessons and tasks

| Task Title | Task ID | linked to lesson  |
| ---------- | ------- | ----------------- |
| Task 1     | 1       | Lesson 1   (DI 1) |
| Task 2     | 2       |                   |

import "./ManageLessons.css";
import HeaderNavBar from "../HeaderNavBar/Header";
import TaskItem from "./TaskItem";
import { useState, useEffect } from "react";
import axios from 'axios';
import { buildApiUrl } from "../../config/api";

export default function ManageLessons() {
    const [lessons, setLessons] = useState([]);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [newLessonDescription, setNewLessonDescription] = useState("");
    const [isAddingLesson, setIsAddingLesson] = useState(false);

    const [tasks, setTasks] = useState([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [addingTaskForLessonId, setAddingTaskForLessonId] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskTimeLimit, setNewTaskTimeLimit] = useState("");
    const [newTaskMemoryLimit, setNewTaskMemoryLimit] = useState("");
    const [isTaskPractice, setIsTaskPractice] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(true);

    //getting task info
    async function fetchTaskDetails(taskID, token) {
        try {
            const res = await axios.get(buildApiUrl(`tasks/${taskID}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                return res.data.data;
            } else {
                console.error('Failed to get task details:', res.data.message);
                return null;
            }
        } catch (error) {
            console.error('Error fetching task details:', error);
            return null;
        }
    }

    // adding a new lesson
    async function handleAddLesson(e) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!newLessonTitle.trim() || !newLessonDescription.trim()) {
            setError("Title and description are required.");
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            return;
        }

        try {
            const res = await axios.post(
                buildApiUrl("admin/add-lesson"),
                {
                    title: newLessonTitle,
                    description: newLessonDescription,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.data?.success) {
                setSuccessMessage("Lesson added successfully!");
                setNewLessonTitle("");
                setNewLessonDescription("");
                setIsAddingLesson(false);

                // Refresh lessons list by refetching or append the new lesson
                setLessons(prev => [...prev, { id: res.data.data.lesson_id, title: newLessonTitle, description: newLessonDescription, tasks: [] }]);
            } else {
                setError(res.data.message || "Failed to add lesson");
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Failed to add lesson");
        }
    }

    //deleting a lesson
    async function handleDeleteLesson(lessonId) {
        const confirmDelete = window.confirm("Are you sure you want to delete this lesson?");
        if (!confirmDelete) return;

        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("You are not authorized.");
            return;
        }

        try {
            const res = await axios.post(
                buildApiUrl("admin/delete-lesson"),
                { lesson_id: lessonId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.data?.success) {
                // Remove the deleted lesson from the state
                setLessons((prevLessons) =>
                    prevLessons.filter((lesson) => lesson.id !== lessonId)
                );
            } else {
                alert("Failed to delete lesson: " + (res.data?.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Error deleting lesson:", err);
            alert("Error deleting lesson: " + (err.response?.data?.message || err.message));
        }
    }

    // create a new task and add it to lesson
    async function handleAddTask(e, lessonId) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!newTaskTitle.trim() || !newTaskDescription.trim()) {
            setError("Title and description are required.");
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) return;

        try {
            // Step 1: Create the task
            const res = await axios.post(
                buildApiUrl("admin/add-task"),
                {
                    title: newTaskTitle,
                    description: newTaskDescription,
                    time_limit: parseInt(newTaskTimeLimit) || 0,
                    memory_limit: parseInt(newTaskMemoryLimit) || 0,
                    is_practice: isTaskPractice,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.data?.success) {
                setError(res.data.message || "Failed to create task");
                return;
            }

            const taskId = res.data.data.task_id;

            // Step 2: Attach the task to the lesson
            const attachRes = await axios.post(
                buildApiUrl("admin/add-task-to-lesson"),
                {
                    task_id: taskId,
                    lesson_id: lessonId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!attachRes.data?.success) {
                setError(attachRes.data.message || "Failed to add task to lesson");
                return;
            }

            // Step 3: Clear inputs and update UI
            setSuccessMessage("Task added to lesson successfully!");
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskTimeLimit("");
            setNewTaskMemoryLimit("");
            setIsTaskPractice(false);
            setAddingTaskForLessonId(null); // Hide task form

            // Create the new task object
            const newTask = {
                id: taskId,
                title: newTaskTitle,
                description: newTaskDescription,
                time_limit: parseInt(newTaskTimeLimit) || 0,
                memory_limit: parseInt(newTaskMemoryLimit) || 0,
                is_practice: isTaskPractice,
            };

            // Step 4: Add task to the correct lesson in local state
            setLessons(prevLessons =>
                prevLessons.map(lesson =>
                    lesson.id === lessonId
                        ? { ...lesson, tasks: [...(lesson.tasks || []), newTask] }
                        : lesson
                )
            );
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || error.message || "Failed to add task");
        }
    }


    // async function handleAddTask(e) {
    //     e.preventDefault();
    //     setError("");
    //     setSuccessMessage("");

    //     if (!newTaskTitle.trim() || !newTaskDescription.trim()) {
    //         setError("Title and description are required.");
    //         return;
    //     }

    //     const token = localStorage.getItem("authToken");
    //     if (!token) return;

    //     try {
    //         const res = await axios.post(
    //             "http://localhost:8080/api/admin/add-task",
    //             {
    //                 title: newTaskTitle,
    //                 description: newTaskDescription,
    //                 time_limit: parseInt(newTaskTimeLimit) || 0,
    //                 memory_limit: parseInt(newTaskMemoryLimit) || 0,
    //                 is_practice: isTaskPractice,
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     "Content-Type": "application/json",
    //                 },
    //             }
    //         );

    //         if (res.data?.success) {
    //             setSuccessMessage("Task added successfully!");
    //             setNewTaskTitle("");
    //             setNewTaskDescription("");
    //             setNewTaskTimeLimit("");
    //             setNewTaskMemoryLimit("");
    //             setIsTaskPractice(false);
    //             setIsAddingTask(false);

    //             // Optionally add the task to tasks state list
    //             const newTask = {
    //                 id: res.data.data.task_id,
    //                 title: newTaskTitle,
    //                 description: newTaskDescription,
    //                 time_limit: newTaskTimeLimit,
    //                 memory_limit: newTaskMemoryLimit,
    //                 is_practice: isTaskPractice,
    //             };
    //             setTasks(prev => [...prev, newTask]);
    //         } else {
    //             setError(res.data.message || "Failed to add task");
    //         }
    //     } catch (error) {
    //         setError(error.response?.data?.message || error.message || "Failed to add task");
    //     }
    // }
    const onTaskDeleted = (deletedTaskId, fromLessonId) => {
        if (fromLessonId) {
            // Remove task only from the specified lesson
            setLessons(prevLessons =>
                prevLessons.map(lesson => {
                    if (lesson.id !== fromLessonId) return lesson;
                    return {
                        ...lesson,
                        tasks: lesson.tasks.filter(task => task.id !== deletedTaskId),
                    };
                })
            );
        } else {
            // Remove task completely from all lessons (and tasks list)
            setLessons(prevLessons =>
                prevLessons.map(lesson => ({
                    ...lesson,
                    tasks: lesson.tasks.filter(task => task.id !== deletedTaskId),
                }))
            );
        }
    };




    useEffect(() => {
        const fetchLessonsAndTasks = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;

                const res = await axios.get(buildApiUrl('lessons'), {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const lessonsData = Array.isArray(res.data.data) ? res.data.data : [];

                const lessonsWithTaskDetails = await Promise.all(
                    lessonsData.map(async (lesson) => {
                        if (!lesson.tasks || lesson.tasks.length === 0) return lesson;
                        const detailedTasks = await Promise.all(
                            lesson.tasks.map(task => fetchTaskDetails(task.id, token))
                        );

                        lesson.tasks = detailedTasks.filter(t => t !== null);

                        return lesson;
                    })
                );

                setLessons(lessonsWithTaskDetails);
                setLoading(false);
            } catch (error) {
                console.error('Error loading lessons:', error);
                setLoading(false);
            }
        };

        fetchLessonsAndTasks();
    }, []);

    if (loading) return <p>Loading...</p>;



    return (
        <div className="manage-lessons-wrapper">
            <HeaderNavBar />
            <h2>Manage Lessons</h2>


            <div className="lesson-controls">
                <button
                    className="manage-lessons-button"
                    onClick={() => setIsAddingLesson(prev => !prev)}
                >
                    {isAddingLesson ? "Cancel" : "Add Lesson"}
                </button>

                <button
                    className="manage-lessons-button"
                    onClick={() => setIsEditMode(prev => !prev)}
                >
                    {isEditMode ? "Exit Edit Mode" : "Edit Lessons"}
                </button>

            </div>


            {isAddingLesson && (
                <form onSubmit={handleAddLesson} className="add-lesson-form">
                    <div>
                        <label>Title:</label>
                        <input
                            type="text"
                            value={newLessonTitle}
                            onChange={e => setNewLessonTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            value={newLessonDescription}
                            onChange={e => setNewLessonDescription(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    {successMessage && <p className="success">{successMessage}</p>}

                    <div className="form-button-wrapper">
                        <button type="submit" className="manage-lessons-button">Submit</button>
                    </div>
                </form>
            )}


            {lessons.length === 0 ? (
                <p>No lessons found.</p>
            ) : (
                <div className="manage-lessons-list">
                    {lessons.map((lesson) => (
                        <div key={lesson.id} className="manage-lesson-item">
                            {isEditMode && (
                                <div className="lesson-buttons">
                                    <button
                                        className="manage-lessons-button delete-button"
                                        onClick={() => handleDeleteLesson(lesson.id)}
                                    >
                                        Delete Lesson
                                    </button>

                                    <button
                                        className="manage-lessons-button"
                                        onClick={() =>
                                            setAddingTaskForLessonId(
                                                addingTaskForLessonId === lesson.id ? null : lesson.id
                                            )
                                        }
                                    >
                                        {addingTaskForLessonId === lesson.id ? "Cancel" : "Add Task"}
                                    </button>
                                </div>
                            )}



                            <h2>{lesson.title}</h2>
                            <p>{lesson.description}</p>

                            {addingTaskForLessonId === lesson.id && (
                                <form
                                    className="add-task-form"
                                    onSubmit={(e) => handleAddTask(e, lesson.id)}
                                    style={{ marginTop: "12px" }}
                                >
                                    <div>
                                        <label>Title:</label>
                                        <input
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label>Description:</label>
                                        <textarea
                                            value={newTaskDescription}
                                            onChange={(e) => setNewTaskDescription(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label>Time Limit (min):</label>
                                        <input
                                            type="number"
                                            value={newTaskTimeLimit}
                                            onChange={(e) => setNewTaskTimeLimit(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label>Memory Limit (MB):</label>
                                        <input
                                            type="number"
                                            value={newTaskMemoryLimit}
                                            onChange={(e) => setNewTaskMemoryLimit(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={isTaskPractice}
                                                onChange={(e) => setIsTaskPractice(e.target.checked)}
                                            />
                                            Is Practice Task
                                        </label>
                                    </div>

                                    {error && <p className="error">{error}</p>}
                                    {successMessage && <p className="success">{successMessage}</p>}

                                    <button type="submit" className="manage-lessons-button">Submit Task</button>
                                </form>
                            )}

                            <h3>Tasks</h3>
                            {lesson.tasks && lesson.tasks.length > 0 ? (
                                <ul className="task-list">
                                    {lesson.tasks.map((task) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            isEditMode={isEditMode}
                                            lessonId={lesson.id}
                                            onTaskDeleted={onTaskDeleted}
                                            // onTaskDeleted={(deletedTaskId, fromLessonId) => {
                                            //     setLessons(prevLessons =>
                                            //         prevLessons.map(lesson => {
                                            //             if (lesson.id !== fromLessonId) return lesson;
                                            //             return {
                                            //                 ...lesson,
                                            //                 tasks: lesson.tasks.filter(t => t.id !== deletedTaskId),
                                            //             };
                                            //         })
                                            //     );
                                            // }}
                                        />
                                    ))}

                                </ul>
                            ) : (
                                <p>No tasks for this lesson.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}

import { useState } from 'react';
import './TaskItem.css';
import axios from 'axios';

export default function TaskItem({ task, isEditMode, onTaskDeleted, lessonId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`);
        if (!confirmed) return;

        try {
            setIsDeleting(true);
            const token = localStorage.getItem('authToken');

            await axios.post(
                'http://localhost:8080/api/admin/delete-task-from-lesson',
                { task_id: task.id, lesson_id: lessonId, },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            onTaskDeleted(task.id, lessonId); 
        } catch (err) {
            console.error('Error deleting task:', err);
            alert('Failed to delete task. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
    <li className="task-item">
      <div className="task-title-row">
        <span
          className={`arrow ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            display: 'inline-block',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            marginRight: '8px',
            cursor: 'pointer',
          }}
        >
          ▶
        </span>
        <strong className="task-title">{task.title}</strong>

        {isEditMode && (
          <button
            onClick={handleDelete}
            className="delete-task-cross"
            disabled={isDeleting}
            title="Delete Task"
                  style={{
            display: 'inline-block',
            marginLeft: '8px',
            cursor: 'pointer',
          }}
          >
            ❌
          </button>
        )}
      </div>

      {isOpen && (
        <div className="task-details">
          <p>{task.Description || task.description}</p>
          <p>Time Limit: {task.time_limit} seconds</p>
          <p>Memory Limit: {task.memory_limit} MB</p>
          <p>Practice Task: {task.is_practice ? 'Yes' : 'No'}</p>
        </div>
      )}
    </li>
  );
}
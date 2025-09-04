// import React from 'react';
// import { useLocation, useParams } from 'react-router-dom';
// import { FaBook } from 'react-icons/fa';
// import './TasksPage.css';
// import { FaCheckCircle, FaRegCircle} from 'react-icons/fa';

// export default function TasksPage() {
//   const { lessonId } = useParams();
//   const location = useLocation();
//   const lesson = location.state?.lesson;

//   if (!lesson) {
//     return (
//       <div className="tasks-page">
//         <h2>Error</h2>
//         <p>No lesson data found. Please navigate from the Lessons page.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="tasks-page">
//       <div className="lesson-header">
//   <h1>
//     Lesson {lessonId}: {lesson.title}
//   </h1>
//   <p>{lesson.description}</p>
// </div>


//       <ul className="task-list">
//   {lesson.tasks.map((task) => (
//     <li key={task.id} className="task-item" tabIndex={0}>
//       <FaBook className="task-icon" />
//       <div className="task-content"></div>
//       <span className="task-title">{task.title}</span>

//     {/*task icons depending on the status of the task*/}
//     {task.status === 0? (
//   <FaRegCircle className="task-check-icon" style={{ color: ' #ffa500' }} title="Not Completed" />
// ) : (
//   <FaCheckCircle className="task-check-icon" style={{ color: ' #ffa500' }} title="Completed" />
// )}
//     </li>
//   ))}
// </ul>
//     </div>
//   );
// }
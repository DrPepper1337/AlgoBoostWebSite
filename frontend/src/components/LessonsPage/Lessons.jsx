import "./Lessons.css";
import "../MemberHub/MemberHub.css";
import { useEffect, useState } from "react";
import "../HeaderNavBar/Header.css";
import axios from "axios";
import { buildApiUrl } from "../../config/api";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    // getting lessons from the backend
    const fetchLessons = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        const res = await axios.get(buildApiUrl("lessons"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data?.success || !Array.isArray(res.data.data)) {
          console.error("Unexpected response structure:", res.data);
          return;
        }

        const lessonsData = res.data.data;
        setLessons(lessonsData);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      }
    };

    fetchLessons();
  }, []);

  return (
    <div className="lessons-wrapper">
      <h2>Lessons</h2>
      {lessons.length === 0 ? (
        <p>Nothing yet—check back soon.</p>
      ) : (
        <ul className="lessons-list">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <strong>{lesson.title}</strong>
              {lesson.description ? ` — ${lesson.description}` : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

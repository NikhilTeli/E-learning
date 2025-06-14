import React from "react";
import "./courseCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { CourseData } from "../../context/CourseContext";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user, isAuth, fetchUser } = UserData();  // Make sure fetchUser is available
  const { fetchCourses } = CourseData();

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this course")) {
      try {
        const { data } = await axios.delete(`${server}/api/course/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed.");
      }
    }
  };

  return (
    <div className="course-card">
      <img src={`${server}/${course.image}`} alt="" className="course-image" />
      <h3>{course.title}</h3>
      <p>Instructor- {course.createdBy}</p>
      <p>Duration- {course.duration} weeks</p>
      <p>Price- ₹{course.price}</p>

      {isAuth ? (
        <>
          {user && user.role !== "admin" ? (
            <>
              {user.subscription?.includes(course._id) ? (
                <button
                  className="common-btn"
                  onClick={() => navigate(`/course/study/${course._id}`)}
                >
                  Get Started
                </button>
              ) : (
                <button
                  className="common-btn"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");

                      const { data } = await axios.post(
                        `${server}/api/verification/${course._id}`,
                        {},
                        { headers: { token } }
                      );

                      toast.success(data.message);
                      await fetchUser();  // Refresh user after purchase
                      navigate(`/course/study/${course._id}`);
                    } catch (error) {
                      toast.error(
                        error.response?.data?.message || "Failed to enroll"
                      );
                    }
                  }}
                >
                  Buy Now
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate(`/course/study/${course._id}`)}
              className="common-btn"
            >
              Study
            </button>
          )}
        </>
      ) : (
        <button onClick={() => navigate("/login")} className="common-btn">
          Get Started
        </button>
      )}

      <br />

      {user && user.role === "admin" && (
        <button
          onClick={() => deleteHandler(course._id)}
          className="common-btn"
          style={{ background: "red" }}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default CourseCard;

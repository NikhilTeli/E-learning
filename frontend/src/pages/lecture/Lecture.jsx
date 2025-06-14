import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setvideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");

  async function fetchLectures() {
    try {
      console.log("lecture here");
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      console.log(data);
      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLecture(data.lecture);
      setLecLoading(false);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setvideo(file);
    };
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("file", video);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      setBtnLoading(false);
      setShow(false);
      fetchLectures();
      setTitle("");
      setDescription("");
      setvideo("");
      setVideoPrev("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);

  async function fetchProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setCompleted(data.courseProgressPercentage);
      setCompletedLec(data.completedLectures);
      setLectLength(data.allLectures);
      setProgress(data.progress);
    } catch (error) {
      console.log(error);
    }
  }

  const addProgress = async (id) => {
    try {
      const { data } = await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      console.log(data.message);
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  console.log(progress);

  useEffect(() => {
    fetchLectures();
    fetchProgress();
  }, []);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="progress">
            Lecture completed - {completedLec} out of {lectLength} <br />
            <progress value={completed} max={100}></progress> {completed} %
          </div>
          <div className="lecture-page">
            <div className="left">
              {lecLoading ? (
                <Loading />
              ) : (
                <>
                  {lecture.video ? (
                    <>
                      <iframe
                        width="100%"
                        height="400"
                        src={lecture.video}
                        title={lecture.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>

                      {/* <video
                        src={`${server}/${lecture.video}`}
                        width={"100%"}
                        controls
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        autoPlay
                        onEnded={() => addProgress(lecture._id)}
                      ></video> */}
                      <h1>{lecture.title}</h1>
                      <h3>{lecture.description}</h3>
                    </>
                  ) : (
                    <h1>Please Select a Lecture</h1>
                  )}
                </>
              )}
            </div>
            <div className="right">
              {user && user.role === "admin" && (
                <button className="common-btn" onClick={() => setShow(!show)}>
                  {show ? "Close" : "Add Lecture +"}
                </button>
              )}

              {show && (
                <div className="lecture-form">
                  <h2>Add Lecture</h2>
                  <form onSubmit={submitHandler}>
                    <label htmlFor="text">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />

                    <label htmlFor="text">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />

                    <input
                      type="file"
                      placeholder="choose video"
                      onChange={changeVideoHandler}
                      required
                    />

                    {videoPrev && (
                      <video
                        src={videoPrev}
                        alt=""
                        width={300}
                        controls
                      ></video>
                    )}

                    <button
                      disabled={btnLoading}
                      type="submit"
                      className="common-btn"
                    >
                      {btnLoading ? "Please Wait..." : "Add"}
                    </button>
                  </form>
                </div>
              )}

              {lectures && lectures.length > 0 ? (
                lectures.map((e, i) => (
                  <>
                    <div
                      onClick={() => fetchLecture(e._id)}
                      key={i}
                      className={`lecture-number ${
                        lecture._id === e._id && "active"
                      }`}
                    >
                      {i + 1}. {e.title}{" "}
                      {progress[0] &&
                        progress[0].completedLectures.includes(e._id) && (
                          <span
                            style={{
                              background: "red",
                              padding: "2px",
                              borderRadius: "6px",
                              color: "greenyellow",
                            }}
                          >
                            <TiTick />
                          </span>
                        )}
                    </div>
                    {user && user.role === "admin" && (
                      <button
                        className="common-btn"
                        style={{ background: "red" }}
                        onClick={() => deleteHandler(e._id)}
                      >
                        Delete {e.title}
                      </button>
                    )}
                  </>
                ))
              ) : (
                <p>No Lectures Yet!</p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Lecture;














// import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
// import "./lecture.css";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import { server } from "../../main";
// import Loading from "../../components/loading/Loading";
// import toast from "react-hot-toast";
// import { TiTick } from "react-icons/ti";

// const Lecture = ({ user }) => {
//   const [lectures, setLectures] = useState([]);
//   const [lecture, setLecture] = useState(null); // 1. Corrected: Initial state to null for an object
//   const [loading, setLoading] = useState(true);
//   const [lecLoading, setLecLoading] = useState(false);
//   const [show, setShow] = useState(false);
//   const params = useParams();
//   const navigate = useNavigate();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [video, setVideo] = useState(""); // File object or empty string
//   const [videoPrev, setVideoPrev] = useState(""); // Data URL string or empty string
//   const [btnLoading, setBtnLoading] = useState(false);

//   // 2. Moved permission check to useEffect
//   useEffect(() => {
//     if (
//       user &&
//       user.role !== "admin" &&
//       (!user.subscription || !user.subscription.includes(params.id))
//     ) {
//       toast.error("You are not subscribed to this course or not an admin.");
//       navigate("/");
//     }
//   }, [user, params.id, navigate]);

//   // 7. Memoized fetchLectures, depends on params.id
//   const fetchLectures = useCallback(async () => {
//     // No setLoading(true) here because the main 'loading' state handles initial load.
//     try {
//       const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
//         headers: {
//           token: localStorage.getItem("token"),
//         },
//       });
//       setLectures(data.lectures || []); // Ensure lectures is an array
//       setLoading(false);
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to fetch lectures"); // 11. Safer error message
//       setLoading(false);
//     }
//   }, [params.id]); // server is stable from import

//   // Memoized fetchLecture
//   const fetchLecture = useCallback(async (id) => {
//     setLecLoading(true);
//     try {
//       const { data } = await axios.get(`${server}/api/lecture/${id}`, {
//         // 3. Corrected: Added server
//         headers: {
//           token: localStorage.getItem("token"),
//         },
//       });
//       setLecture(data.lecture);
//       setLecLoading(false);
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.message || "Failed to fetch lecture details"
//       ); // 11.
//       setLecLoading(false);
//     }
//   }, []); // server is stable from import

//   const changeVideoHandler = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onloadend = () => {
//         setVideoPrev(reader.result);
//         setVideo(file);
//       };
//     } else {
//       setVideoPrev("");
//       setVideo("");
//     }
//   };

//   const submitHandler = async (e) => {
//     e.preventDefault();
//     if (!video) {
//       toast.error("Please select a video file.");
//       return;
//     }
//     setBtnLoading(true);
//     const myForm = new FormData();
//     myForm.append("title", title);
//     myForm.append("description", description);
//     myForm.append("file", video);

//     try {
//       const { data } = await axios.post(
//         `${server}/api/course/${params.id}`, // Endpoint to add lecture to a course
//         myForm,
//         {
//           headers: {
//             token: localStorage.getItem("token"),
//             // 'Content-Type': 'multipart/form-data' is set automatically by browser for FormData
//           },
//         }
//       );

//       toast.success(data.message);
//       setBtnLoading(false);
//       setShow(false);
//       fetchLectures(); // Refresh lecture list
//       setTitle("");
//       setDescription("");
//       setVideo("");
//       setVideoPrev("");
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to add lecture"); // 11.
//       setBtnLoading(false);
//     }
//   };

//   const deleteHandler = async (lectureId) => {
//     if (window.confirm("Are you sure you want to delete this lecture?")) {
//       // 8. Added window.
//       try {
//         const { data } = await axios.delete(
//           `${server}/api/lecture/${lectureId}`,
//           {
//             headers: {
//               token: localStorage.getItem("token"),
//             },
//           }
//         );

//         toast.success(data.message);
//         fetchLectures(); // Refresh lecture list
//         if (lecture && lecture._id === lectureId) {
//           // If current lecture is deleted
//           setLecture(null);
//         }
//       } catch (error) {
//         toast.error(
//           error?.response?.data?.message || "Failed to delete lecture"
//         ); // 11.
//       }
//     }
//   };

//   const [completedPercentage, setCompletedPercentage] = useState(0);
//   const [completedLecturesCount, setCompletedLecturesCount] = useState(0);
//   const [totalLecturesCount, setTotalLecturesCount] = useState(0);
//   const [progressData, setProgressData] = useState(null); // Changed to null, expect an object or null

//   // Memoized fetchProgress, depends on params.id
//   const fetchProgress = useCallback(async () => {
//     try {
//       const { data } = await axios.get(
//         `${server}/api/user/progress?course=${params.id}`,
//         {
//           headers: {
//             token: localStorage.getItem("token"),
//           },
//         }
//       );
//       setCompletedPercentage(data.courseProgressPercentage || 0);
//       // Assuming API sends counts directly, adjust if API sends arrays to count .length
//       setCompletedLecturesCount(
//         data.completedLecturesCount !== undefined
//           ? data.completedLecturesCount
//           : data.completedLectures?.length || 0
//       );
//       setTotalLecturesCount(
//         data.allLecturesCount !== undefined
//           ? data.allLecturesCount
//           : data.allLectures?.length || 0
//       );
//       setProgressData(data.progress || null); // data.progress likely an object like { completedLectures: [...] }
//     } catch (error) {
//       console.error("Failed to fetch progress:", error); // Less intrusive error for progress
//     }
//   }, [params.id]);

//   // Memoized addProgress, depends on params.id and fetchProgress
//   const addProgress = useCallback(
//     async (lectureId) => {
//       if (!lectureId) return;
//       try {
//         await axios.post(
//           `${server}/api/user/progress?course=${params.id}&lectureId=${lectureId}`,
//           {},
//           {
//             headers: {
//               token: localStorage.getItem("token"),
//             },
//           }
//         );
//         // console.log("Progress update: ", data.message);
//         fetchProgress(); // Refresh progress data
//       } catch (error) {
//         // toast.error(error?.response?.data?.message || "Failed to update progress"); // 11.
//         console.error("Failed to add progress:", error);
//       }
//     },
//     [params.id, fetchProgress]
//   );

//   // 7. useEffect for initial data fetching
//   useEffect(() => {
//     // Only fetch if user is defined and authorized (or if data is public and auth is for specific features)
//     // The navigation useEffect already handles unauthorized non-admins.
//     // Admins or subscribed users can fetch.
//     if (
//       user &&
//       (user.role === "admin" ||
//         (user.subscription && user.subscription.includes(params.id)))
//     ) {
//       setLoading(true); // Set loading before fetching lectures
//       fetchLectures();
//       fetchProgress();
//     } else if (user === null) {
//       // Explicitly not logged in
//       navigate("/login"); // Or to home, or show message
//     }
//     // If user is undefined, it might still be loading, so don't do anything yet.
//   }, [user, params.id, fetchLectures, fetchProgress, navigate]);

//   // Conditional rendering if user data is not yet available or not authorized
//   // This assumes `user` prop might be initially undefined while app fetches it.
//   if (user === undefined) {
//     return <Loading />; // Waiting for user data
//   }
//   // The useEffect for navigation handles redirection for unauthorized users.
//   // This is a fallback or covers the time until navigation completes.
//   if (
//     user &&
//     user.role !== "admin" &&
//     (!user.subscription || !user.subscription.includes(params.id))
//   ) {
//     return <Loading />; // Or a "Not Authorized" message if navigation hasn't occurred yet
//   }

//   return (
//     <>
//       {loading ? (
//         <Loading />
//       ) : (
//         <>
//           <div className="progress">
//             Lectures completed - {completedLecturesCount} out of{" "}
//             {totalLecturesCount} <br />
//             <progress value={completedPercentage} max={100}></progress>{" "}
//             {completedPercentage} %
//           </div>
//           <div className="lecture-page">
//             <div className="left">
//               {lecLoading ? (
//                 <Loading />
//               ) : (
//                 <>
//                   {lecture && lecture.video && lecture.video.url ? ( // 5. Assuming lecture.video.url
//                     <>
//                       <video
//                         src={lecture.video.url} // 5. Use lecture.video.url
//                         width={"100%"}
//                         controls
//                         controlsList="nodownload noremoteplayback"
//                         disablePictureInPicture
//                         disableRemotePlayback
//                         autoPlay
//                         onEnded={() => addProgress(lecture._id)}
//                         key={lecture._id} // Add key if video source can change for the same component instance
//                       ></video>
//                       <h1>{lecture.title}</h1>
//                       <h3>{lecture.description}</h3>
//                     </>
//                   ) : (
//                     <h1>Please Select a Lecture</h1>
//                   )}
//                 </>
//               )}
//             </div>
//             <div className="right">
//               {user && user.role === "admin" && (
//                 <button
//                   type="button"
//                   className="common-btn"
//                   onClick={() => setShow(!show)}
//                 >
//                   {show ? "Close" : "Add Lecture +"}
//                 </button>
//               )}

//               {show && (
//                 <div className="lecture-form">
//                   <h2>Add Lecture</h2>
//                   <form onSubmit={submitHandler}>
//                     <label htmlFor="lecture-title">Title</label>{" "}
//                     {/* 9. htmlFor matches id */}
//                     <input
//                       id="lecture-title" // 9. Added id
//                       type="text"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       required
//                     />
//                     <label htmlFor="lecture-description">Description</label>{" "}
//                     {/* 9. htmlFor matches id */}
//                     <input
//                       id="lecture-description" // 9. Added id
//                       type="text"
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                       required
//                     />
//                     <input
//                       type="file"
//                       aria-label="Choose video" // For accessibility
//                       accept="video/*" // Specify accepted file types
//                       onChange={changeVideoHandler}
//                       required
//                     />
//                     {videoPrev && (
//                       <video
//                         src={videoPrev}
//                         // 12. alt attribute removed
//                         width={300}
//                         controls
//                       ></video>
//                     )}
//                     <button
//                       disabled={btnLoading}
//                       type="submit"
//                       className="common-btn"
//                     >
//                       {btnLoading ? "Please Wait..." : "Add"}
//                     </button>
//                   </form>
//                 </div>
//               )}

//               {lectures && lectures.length > 0
//                 ? lectures.map((e, i) => (
//                     <React.Fragment key={e._id}>
//                       {/* 4. Key is e._id, Fragment groups elements */}
//                       <div
//                         onClick={() => fetchLecture(e._id)}
//                         className={`lecture-number ${
//                           lecture && lecture._id === e._id ? "active" : ""
//                         }`} // Check lecture exists
//                         role="button" // For accessibility
//                         tabIndex={0} // For keyboard navigation
//                         onKeyPress={(event) => {
//                           if (event.key === "Enter" || event.key === " ")
//                             fetchLecture(e._id);
//                         }} // Keyboard accessibility
//                       >
//                         {i + 1}. {e.title}{" "}
//                         {/* 6. Safer check for progress data */}
//                         {progressData &&
//                           progressData.completedLectures &&
//                           progressData.completedLectures.includes(e._id) && (
//                             <span
//                               style={{
//                                 background: "green", // Changed for better UX (tick is usually green)
//                                 padding: "2px 5px",
//                                 borderRadius: "6px",
//                                 color: "white",
//                                 marginLeft: "5px",
//                               }}
//                             >
//                               <TiTick />
//                             </span>
//                           )}
//                       </div>

//                       {/* VIDEO PLAYER */}
//                       {e.video && (
//                         <div style={{ margin: "10px 0" }}>
//                           <iframe
//                             width="100%"
//                             height="315"
//                             src={e.video}
//                             title={e.title}
//                             frameBorder="0"
//                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                             allowFullScreen
//                           ></iframe>
//                         </div>
//                       )}

//                       {user && user.role === "admin" && (
//                         <button
//                           type="button"
//                           className="common-btn"
//                           style={{
//                             background: "red",
//                             margin: "5px 0 10px 20px",
//                           }} // Added some margin for layout
//                           onClick={() => deleteHandler(e._id)}
//                         >
//                           Delete
//                         </button>
//                       )}
//                     </React.Fragment>
//                   ))
//                 : !loading && (
//                     <p>No Lectures Yet!</p>
//                   ) // Show only if not loading
//               }
//             </div>
//           </div>
//         </>
//       )}
//     </>
//   );
// };

// export default Lecture;

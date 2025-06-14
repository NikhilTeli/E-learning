// import {instance} from "../index.js"
import TryCatch from "../middlewares/TryCatch.js";
import {Courses} from "../models/Courses.js";
import {Lecture} from "../models/Lecture.js";
import  { Temp }  from "../models/Temp.js";
// import crypto from "crypto";
import {Progress} from "../models/Progress.js";

import mongoose from "mongoose"; // make sure this is imported

//uuid temprary
import { v4 as uuidv4 } from "uuid";



export const getAllCourses = TryCatch(async(req,res)=>{
    const courses = await Courses.find();
    res.json({
        courses,
    });

});

export const getSingleCourse = TryCatch(async(req,res)=>{
    const course = await Courses.findById(req.params.id);

    res.json({
        course,
    });
});


export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await Temp.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lectures });
  }

  const courseId = new mongoose.Types.ObjectId(req.params.id);

  // console.log(user.subscription);
  // console.log(courseId);

  if (!user.subscription.some(id => id.equals(courseId))) {
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });
  }

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    return res.status(404).json({ message: "Lecture not found" });
  }

  const user = await Temp.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture });
  }

  const courseId = lecture.course; // assuming lecture has a 'course' field

  if (!user.subscription.some(id => id.equals(courseId))) {
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });
  }

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async(req,res)=>{
    const courses = await Courses.find({_id: req.user.subscription})

    res.json({
        courses,
    });
})



// controllers/courseController.js
// import Razorpay from "razorpay";                // ← still here if you ever revert
// const instance = new Razorpay({ /* …keys… */ }); // ← still here if you ever revert

export const checkout = TryCatch(async (req, res) => {
  console.log("checkout here");

  // ──────────────────── 1.  Fetch user & course ────────────────────
  const user   = await Temp.findById(req.user._id);   // or User.findById(...)
  const course = await Courses.findById(req.params.id);

  if (!user || !course) {
    return res.status(404).json({ message: "User or Course not found" });
  }

  // ──────────────────── 2.  Prevent duplicates ────────────────────
  if (user.subscription.includes(course._id)) {
    return res.status(400).json({ message: "You already have this course" });
  }

  // ──────────────────── 3.  Fake order (UUID) ──────────────────────
  const orderId = uuidv4();

  /*  // Razorpay code (kept for reference)
  const options = {
    amount: Number(course.price * 100),
    currency: "INR",
  };
  const { id: orderId } = await instance.orders.create(options);
  */

  // ──────────────────── 4.  “Verification” & enrolment ─────────────
  user.subscription.push(course._id);

  await Progress.create({
    course:           course._id,
    completedLectures: [],
    user:             user._id,
  });

  await user.save();

  // ──────────────────── 5.  Send response ──────────────────────────
  return res.status(201).json({
    message: "Course purchased successfully",
    orderId,   // UUID for the frontend, if you still want to log it
    course,
  });
});







export const paymentVerification = TryCatch(async (req, res) => {

console.log("verification here");
  // Enroll the user directly (no payment verification now)
  const user = await Temp.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (!user || !course) {
    return res.status(404).json({
      message: "User or Course not found",
    });
  }

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "User already enrolled in this course",
    });
  }

  user.subscription.push(course._id);

  await Progress.create({
    course: course._id,
    completedLectures: [],
    user: req.user._id,
  });

  await user.save();

  res.status(200).json({
    message: "Course Purchased Successfully",
  });
});


export const addProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const { lectureId } = req.query;

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({
      message: "Progress recorded",
    });
  }

  progress.completedLectures.push(lectureId);

  await progress.save();

  res.status(201).json({
    message: "new Progress added",
  });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.find({
    user: req.user._id,
    course: req.query.course,
  });

  if (!progress) return res.status(404).json({ message: "null" });

  const allLectures = (await Lecture.find({ course: req.query.course })).length;

  const completedLectures = progress[0].completedLectures.length;

  const courseProgressPercentage = (completedLectures * 100) / allLectures;

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  });
});

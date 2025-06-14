import express from 'express'
import dotenv from "dotenv";
import { connectDb } from './database/db.js';
import cors from 'cors';


dotenv.config();

// const express = require('express')
const app = express()

//using middlewares
app.use(express.json());
app.use(cors());

const port = 5000;

app.get('/',(req,res) =>{
    res.send("server is working")
})

app.use("/uploads",express.static("uploads"))

//importing routes
import userRoutes from './routes/user.js';
import courseRoutes from './routes/course.js'
import adminRoutes from './routes/admin.js'

//using routes
app.use('/api',userRoutes);
app.use('/api',courseRoutes);
app.use('/api',adminRoutes);

app.listen(port, ()=>{
    console.log(`server is running on server: ${port}`);
    connectDb()
})
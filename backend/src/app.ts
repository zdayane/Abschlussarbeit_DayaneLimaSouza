import express from 'express';
import "express-async-errors"; 
import cookieParser from 'cookie-parser';
import loginRouter from './routes/login';


const app = express();

// Middleware:
app.use('*', express.json())

app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

import cors from "cors";
import userRouter from './routes/user';
import boardRouter from './routes/board';
import newsRouter from './routes/news';
import painelRouter from './routes/painel';
import feedbackRouter from './routes/feedback';
import commentRouter from './routes/comment';

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 

// Routes
app.use("/user", userRouter)
app.use("/board", boardRouter)
app.use("/news", newsRouter)
app.use("/login", loginRouter)
app.use("/painel", painelRouter)
app.use("/feedback", feedbackRouter)
app.use("/comment", commentRouter)

export default app;
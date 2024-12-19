// import express from 'express';
// import cors from "cors";
// import cookieParser from "cookie-parser";

// const app = express();

// app.use(
//     cors({
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         credentials: true,
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
// app.use(cookieParser());

// import userRoutes from "./routes/users.routes.js";
// app.use("/api/v1/users", userRoutes);

// import taskRoutes from "./routes/tasks.routes.js";
// app.use("/api/v1/tasks", taskRoutes);


// app.use("*", (req, res, next) => {
//     const error = new Error(`Cant find the ${req.originalUrl} on the server`);
//     error.statusCode = 404;
//     error.status = "fail";
//     next(error);
// });

// app.use((err, req, res, next) => {
//     res.status(err.statusCode || 500).json({
//         statusCode: err.statusCode || 500,
//         message: err.message || "Internal Server Error",
//     });
// });


// export { app };


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',  // Frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import userRoutes from './routes/users.routes.js';
app.use('/api/v1/users', userRoutes);

import taskRoutes from './routes/tasks.routes.js';
app.use('/api/v1/tasks', taskRoutes);


app.use('*', (req, res, next) => {
    const error = new Error(`Can't find the ${req.originalUrl} on the server`);
    error.statusCode = 404;
    error.status = 'fail';
    next(error);
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message || 'Internal Server Error',
    });
});

export { app };

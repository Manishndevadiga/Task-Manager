// index.js

import dotenv from "dotenv";
import { createServer } from "http";
import { app } from "./app.js";
import { Server as socketIo } from "socket.io";
import { initializeScheduler } from './Scheduler.js';



dotenv.config({ path: "../.env" });

const server = createServer(app);

const io = new socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const userSockets = {};

// Handle socket connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("register", (userId) => {
        userSockets[userId] = socket.id;
        console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        for (let userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
    });
});


export { userSockets };


initializeScheduler();

import db from "./database/db.js";
db()
    .then(() => {
        server.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port: ${process.env.PORT || 4000}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    });

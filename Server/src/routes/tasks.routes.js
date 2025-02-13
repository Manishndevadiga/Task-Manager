import { Router } from "express";
import { createTask } from "../controllers/task.controller.js";
import upload from "../utils/multer/upload.js";
import { getTasks, getTaskById, updateTaskById, deleteTaskById, updateTaskStatusById } from "../controllers/task.controller.js";

const router = Router();

router.route("/createTask").post(upload.single("file"), createTask);

router.route("/getTasks").get(getTasks);

router.route("/getTasks/:id").get(getTaskById);


//this is for admin...
router.route("/updateTask/:taskId/:userId").put(upload.single("file"), updateTaskById);

//this is for client he can only change the status 
router.route("/updateTaskStatus/:taskId/:userId").put(updateTaskStatusById);

router.route("/deleteTask/:taskId/:userId").delete(deleteTaskById);


export default router;

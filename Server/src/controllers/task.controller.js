import cloudinary from "../utils/multer/cloudinary.js";
import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { userSockets } from "../index.js";


//This is for admin, here admin creates the New Tasks
const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, dueDate, createdBy } = req.body;

    const admin = await User.findById(createdBy);
    if (!admin || admin.role !== "admin") {
        throw new ApiError(403, "Only admins can create tasks.");
    }

    const user = await User.findById(assignedTo);
    if (!user) {
        throw new ApiError(404, "Assigned user not found.");
    }

    if (user.role === "admin") {
        throw new ApiError(400, "You cannot assign a task to an admin.");
    }

    const existingTask = await Task.findOne({ assignedTo, status: { $in: ["Pending", "In Progress"] } });
    if (existingTask) {
        throw new ApiError(400, "The user already has an ongoing task (Pending/In Progress). Cannot assign a new task.");
    }

    let fileUrl = null;
    let fileName = null;

    if (req.file) {
        const file = req.file;
        try {

            const result = await cloudinary.uploader.upload(file.path, {
                folder: "tasks",
                resource_type: "auto",
            });

            fileUrl = result.secure_url;
            fileName = result.original_filename;
        } catch (error) {
            throw new ApiError(500, "Error uploading file to Cloudinary.");
        }
    }

    const task = await Task.create({
        title,
        description,
        assignedTo,
        dueDate,
        file: {
            fileName,
            fileUrl,
        },
        createdBy,
    });

    const socketId = userSockets[assignedTo];
    if (socketId) {
        io.to(socketId).emit("taskCreated", {
            message: "You have a new task assigned to you.",
            task,
        });
    }

    res.status(201).json({
        message: "Task created successfully",
        task,
    });
});


const getTasks = asyncHandler(async (req, res) => {
    const { status, assignedTo, page = 1, limit = 10 } = req.query;


    let filter = {};

    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
        filter.status = status;
    }

    if (assignedTo) {
        filter.assignedTo = assignedTo;
    }


    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
    };

    const tasks = await Task.paginate(filter, options);

    res.status(200).json({
        message: 'Tasks fetched successfully',
        data: tasks,
    });
});


const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
        return res.status(404).json({
            message: 'Task not found',
        });
    }

    res.status(200).json({
        message: 'Task fetched successfully',
        data: task,
    });
});



//this is for admin he can update the task
const updateTaskById = asyncHandler(async (req, res) => {
    const { taskId, userId } = req.params;
    const { title, description, assignedTo, dueDate, status } = req.body;

    // Check if the user is an admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can update tasks.' });
    }

    // Find the existing task
    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;

    // Handle file upload and update the existing file
    if (req.file) {
        const file = req.file;
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "tasks",
                resource_type: "auto",
            });

            // Update task file details
            task.file = {
                fileUrl: result.secure_url,
                fileName: result.original_filename
            };
        } catch (error) {
            throw new ApiError(500, "Error uploading file to Cloudinary.");
        }
    }

    // Save the updated task
    await task.save();

    res.status(200).json({
        message: 'Task updated successfully',
        data: task,
    });
});




//for clients he can only change the status
const updateTaskStatusById = asyncHandler(async (req, res) => {
    const { taskId, userId } = req.params;
    const { status } = req.body;


    const user = await User.findById(userId);
    if (!user || user.role !== 'user') {
        return res.status(403).json({ message: 'Only users can update the status of tasks.' });
    }


    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }


    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
        task.status = status;
    } else {
        return res.status(400).json({ message: 'Invalid status provided' });
    }


    await task.save();


    res.status(200).json({
        message: 'Task status updated successfully',
        data: task,
    });
});



const deleteTaskById = asyncHandler(async (req, res) => {
    const { taskId, userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete tasks.' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(taskId);


    res.status(200).json({
        message: 'Task deleted successfully',
    });
});


const createTaskBySystem = async (req, res) => {
    const title = "Daily Task";
    const description = "This is your daily task. Please complete it.";
    const status = "Pending";

    const assignedTo = req.body.assignedTo;
    const createdBy = assignedTo;


    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);


    const user = await User.findById(assignedTo);
    if (!user) {
        throw new ApiError(404, "Assigned user not found.");
    }


    if (user.role === "admin") {
        throw new ApiError(400, "You cannot assign a task to an admin.");
    }


    const existingTask = await Task.findOne({
        assignedTo,
        status: { $in: ["Pending", "In Progress"] },
    });
    if (existingTask) {
        throw new ApiError(400, "The user already has an ongoing task (Pending/In Progress). Cannot assign a new task.");
    }


    const task = await Task.create({
        title,
        description,
        assignedTo,
        dueDate,
        status,
        createdBy,
        assignedBy: "System",
    });

    if (res) {
        res.status(201).json({
            message: "Task created successfully",
            task,
        });
    } else {
        console.log(`Task created for user ${assignedTo}:`, task);
    }
};



export { createTask, getTasks, getTaskById, updateTaskById, deleteTaskById, updateTaskStatusById, createTaskBySystem };



































// const createTask = asyncHandler(async (req, res) => {
//     const { title, description, assignedTo, dueDate, createdBy } = req.body;

//     let fileUrl = null;
//     let fileName = null;

//     if (req.file) {
//         const file = req.file;
//         try {
//             // Upload file to Cloudinary
//             const result = await cloudinary.uploader.upload(file.path, {
//                 folder: "tasks", // Define folder on Cloudinary
//                 resource_type: "auto", // Auto-detect file type
//             });

//             fileUrl = result.secure_url; // Get the file URL from Cloudinary
//             fileName = result.original_filename; // Get the original filename
//         } catch (error) {
//             throw new ApiError(500, "Error uploading file to Cloudinary.");
//         }
//     }

//     // Create the task and save it to the database
//     const task = await Task.create({
//         title,
//         description,
//         assignedTo,
//         dueDate,
//         file: {
//             fileName,
//             fileUrl,
//         },
//         createdBy,
//     });

//     res.status(201).json({
//         message: "Task created successfully",
//         task,
//     });
// });

// export { createTask };


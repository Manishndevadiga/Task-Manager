import cron from "node-cron";
import User from "./models/user.model.js";
import { createTaskBySystem } from "./controllers/task.controller.js";

export const initializeScheduler = () => {
    //i kept it for 5 minutes instead of one day
    cron.schedule("*/2 * * * *", async () => {
        console.log("Running task scheduler...");

        try {
            const users = await User.find();

            for (let user of users) {
                const taskData = {
                    assignedTo: user._id,
                    createdBy: user._id,
                };

                try {
                    await createTaskBySystem({ body: taskData }, null);
                    console.log(`Task created for user ${user._id}`);
                } catch (userError) {
                    console.error(`Error creating task for user ${user._id}:`, userError);
                }
            }

            console.log("Task scheduler completed for all users.");
        } catch (error) {
            console.error("Error running task scheduler:", error);
        }
    });

    console.log("Task scheduler initialized.");
};


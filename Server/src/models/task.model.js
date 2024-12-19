import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed"],
        default: "Pending",
    },

    description: {
        type: String,
        default: "",
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    dueDate: {
        type: Date,
        required: false,
    },

    file: {
        fileName: {
            type: String,
            required: false,
        },
        fileUrl: {
            type: String,
            required: false,
        },
    },

    assignedBy: {
        type: String,
        default: "Manually Assigned",
        required: false
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

taskSchema.plugin(mongoosePaginate);


export default mongoose.model("Task", taskSchema);

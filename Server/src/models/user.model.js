import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },

    age: {
        type: Number,
        required: true,
    },

    role: {
        type: String,
        enum: ["client", "admin"],
        default: "client",
    },

}, { timestamps: true });

export default mongoose.model("User", userSchema);

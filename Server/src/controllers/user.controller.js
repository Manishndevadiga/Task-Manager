import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createUser = asyncHandler(async (req, res) => {
    const { name, age, role } = req.body;

    if (!name || !age || !role) {
        throw new ApiError(400, "All fields are required: name, age, role");
    }

    const user = await User.create({ name, age, role });

    res.status(201).json(new ApiResponse(201, "User created successfully", user));
});


export { createUser };

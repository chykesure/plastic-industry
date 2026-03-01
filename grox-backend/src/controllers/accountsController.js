import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // <-- add this

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Create new user
// Create new user
export const createUser = async (req, res) => {
    try {
        const { email, role, status } = req.body;

        if (!email || !role || !status) {
            return res.status(400).json({ message: "Please fill all fields correctly" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const username = email.split("@")[0];

        // Pass plain password; schema pre-save hook will hash it
        const user = await User.create({
            username,
            email,
            password: "1234", // plain password only
            role: role.trim(),
            status,
            forcePasswordChange: true,
        });

        res.status(201).json({ message: "User created successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// List users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find(); // no populate needed
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role, status } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update email
        if (email) user.email = email.trim();

        // Update role as name directly
        if (role) user.role = role.trim();

        // Update status
        if (status) user.status = status;

        await user.save();

        res.json({ message: "User updated successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.deleteOne();
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// controllers/user.controller.js
export const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, forceChange } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Assign plain password; Mongoose pre("save") hook will hash it
        user.password = password;
        user.forcePasswordChange = !!forceChange;

        await user.save();
        res.json({ message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};



export const loginUser = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        });

        if (!user) return res.status(400).json({ message: "Invalid login details" });

        // Compare password using schema method
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        // Create JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                forcePasswordChange: user.forcePasswordChange,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

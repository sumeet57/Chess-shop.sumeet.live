import { comparePassword, hashPassword } from "../utils/password.utils.js";
import User from "../models/user.model.js";
import { generateToken, tokenOptions } from "../utils/token.utils.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const tokens = await generateToken(newUser._id);

    await newUser.save();

    return res
      .status(201)
      .cookie("accessToken", tokens.accessToken, tokenOptions)
      .cookie("refreshToken", tokens.refreshToken, tokenOptions)
      .json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const tokens = await generateToken(user._id);

    res
      .cookie("accessToken", tokens.accessToken, tokenOptions)
      .cookie("refreshToken", tokens.refreshToken, tokenOptions);
    res.status(200).json({ message: "Login successful" });
    console.log("Login successful for user:", user._id);
    return;
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

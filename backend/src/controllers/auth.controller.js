import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  try {
    let { firstName, lastName, email, password } = req.body;

    let existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "*Password must be at least 8 characters!",
      });
    }

    // Auto username generate
    let baseUserName = `${firstName}${lastName}`
      .toLowerCase()
      .replace(/\s+/g, "");

    let userName = baseUserName;
    let count = 1;

    while (await User.findOne({ userName })) {
      userName = `${baseUserName}${count}`;
      count++;
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
    });

    let token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(201).json({
      message: "User signed up successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logIn = async (req, res) => {
    try {
        let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User doesn't exist !" });
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({message:"Incorrect password !"})
    }
    
    let token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: process.env.NODE_ENVIRONMENT === "production",
    });
    return res.status(200).json({ message: "User logged in successfully.", user });
    } catch (error) {
         return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "User logged out successfully." });
    } catch (error) {
        return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
    }
}

import User from "../models/userDetail.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import mongoose from "mongoose";
dotenv.config();

/**middleware for verify user */
const verifyUser = async (req, res, next) => {
  try {
    const { username } = req.method === "GET" ? req.query : req.body;

    // Check user existence
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach the user to the request for later use if needed
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//Register User

const register = async (req, res) => {
  try {
    const {
      username,
      name,
      lname,
      number,
      email,
      password,
      address,
      city,
      service,
      weight,
      height,
      profile,
      program,
      beforefrbody,
      beforebabody,
      afterfrbody,
      afterbabody,
      coach,
      coachImg,
      role,
    } = req.body;

    // Checking if username already exists
    const isUsernameTaken = await User.findOne({ username });
    if (isUsernameTaken) {
      return res.status(400).json({ error: "Please use a unique username" });
    }

    // Checking if email already exists
    const isEmailTaken = await User.findOne({ email });
    if (isEmailTaken) {
      return res.status(400).json({ error: "Please use a unique email" });
    }

    // Hashing the password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Creating a new user
    const user = new User({
      username,
      name,
      lname,
      email,
      password: encryptedPassword,
      address,
      number,
      city,
      service,
      weight,
      height,
      program,
      coach,
      profile: profile || " ",
      beforefrbody: beforefrbody || " ",
      beforebabody: beforebabody || " ",
      afterfrbody: afterfrbody || " ",
      afterbabody: afterbabody || " ",
      coachImg,
      role,
    });

    // Saving the user to the database
    await user.save();

    return res.status(201).json({ msg: "User Registered Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};
/** User Data */
const getUser = async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).json({ error: "Invalid Username" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password from user
    const { password, ...rest } = Object.assign({}, user.toJSON());

    return res.status(200).json(rest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**Login User */
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send({ err: "Username not found" });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(401).send({ err: "Password does not match" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_TOKEN,
      {
        expiresIn: "12h",
      }
    );

    return res.status(200).send({
      msg: "Login Successful",
      username: user.username,
      token,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: error.message || "Internal Server Error" });
  }
};
/** delete user */
const deleteUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 404, error: "User not found" });
    }

    // Implement any additional authorization checks here (e.g., check user roles, permissions)

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ status: 200, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
};
/** get all users */
const getUsers = async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.status(200).json({ status: 200, data: allUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
};
/**Update user profile */
const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      // Update the data using async/await
      const result = await User.updateOne({ _id: userId }, body);

      // Check if the user was found and updated
      if (result.n > 0) {
        return res.status(200).send({ msg: "Record Updated...!" });
      } else {
        return res.status(404).send({ error: "User Not Found...!" });
      }
    } else {
      return res.status(401).send({ error: "User Not Found...!" });
    }
  } catch (error) {
    console.error("Update user error:", error);

    // Log detailed error information
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

/** Generate OTP code */
const generateOTP = async (req, res) => {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
};
/** verify OTP code */
const verifyOTP = async (req, res) => {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; //reset otp value
    req.app.locals.resetSession = true; //start session for reset password
    return res.status(201).send({ msg: "Verify seccessfuly!" });
  }
  return res.status(400).send({ err: "Invalid Otp!!" });
};

const createResetSession = async (req, res) => {
  if (req.app.locals.resetSession) {
    console.log("Reset session flag is set:", req.app.locals.resetSession);
    return res.status(201).json({ flag: req.app.locals.resetSession });
  }

  console.log("Session expired");
  return res.status(440).json({ error: "Session expired!" });
};
const resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ err: "Session expired!" });

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).send({ err: "Username not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.findOneAndUpdate(
        { username: user.username },
        { password: hashedPassword }
      );

      return res.status(201).send({ msg: "Password Updated!!" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).send({ err: "Unable to update password" });
    }
  } catch (error) {
    console.error("Error handling reset password:", error);
    return res.status(401).send({ err: "Unauthorized" });
  }
};

export {
  register,
  getUser,
  loginUser,
  updateUser,
  generateOTP,
  verifyOTP,
  createResetSession,
  resetPassword,
  verifyUser,
  getUsers,
  deleteUserById,
};

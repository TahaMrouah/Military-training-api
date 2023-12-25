import express from "express";
import * as controller from "../controllers/userController.js";
import Auth, { localVariables } from "../middleware/auth.js";
import { registerMail } from "../controllers/mailer.js";
//import path from "path";
const router = express.Router();
//POST
router.route("/register").post(controller.register); //registerUser
router.route("/registerMail").post(registerMail); //send email
router.route("/auth").post(controller.verifyUser, (req, res) => {
  res.end();
}); //auth user
router.route("/login").post(controller.verifyUser, controller.loginUser); //login app
//Get
router.route("/user/:username").get(controller.getUser); //user with username
router
  .route("/generateOTP")
  .get(controller.verifyUser, localVariables, controller.generateOTP); //gen otp
router.route("/verifyOTP").get(controller.verifyUser, controller.verifyOTP); //verify otp
router.route("/createResetSession").get(controller.createResetSession); //reset all
router.route("/allUsers").get(controller.getUsers); // get all users
//Put
router.route("/updateUser").put(Auth, controller.updateUser); //update profile
router
  .route("/resetPassword")
  .put(controller.verifyUser, controller.resetPassword); // reset password
//delete
router.route(`/user/:id`).delete(controller.deleteUserById);
export default router;

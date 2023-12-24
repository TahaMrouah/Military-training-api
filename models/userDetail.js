import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide unique username"],
      unique: [true, "Username Exist"],
    },
    name: String,
    lname: String,
    email: { type: String, unique: true },
    mobile: Number,
    password: String,
    address: String,
    city: String,
    service: String,
    weight: Number,
    height: Number,
    profile: String,
  },

  { collection: "userInfo" },
  { timestamps: true }
);

const User = mongoose.model("userInfo", userDetailsSchema);
export default User;

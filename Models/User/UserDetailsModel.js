import mongoose from "mongoose";
import bcrypt from "bcrypt";

const User_schema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  otp: {
    type: String,
  },
  otpExpiresAt: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBlock: { 
    type: Boolean, 
    default: false
 },
  isActive: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    require: true,
    default: Date.now(),
  },
});
User_schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);

  next();
});

const user = mongoose.model("Users", User_schema);
export default user;

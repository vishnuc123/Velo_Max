import mongoose from "mongoose";

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
  googleId: {
    type:String,
    required:false
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBlock: { 
    type: Boolean, 
    default: false
 },
 resetPasswordToken: {
  type: String,
  default: null, // Token will only exist if a reset request is made
},
resetPasswordExpires: {
  type: Date,
  default: null, // Expiry timestamp for the reset token
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

const user = mongoose.model("Users", User_schema);
export default user;

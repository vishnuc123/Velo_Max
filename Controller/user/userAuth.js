import User from "../../Models/User/UserDetailsModel.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import user from "../../Models/User/UserDetailsModel.js";
dotenv.config();

export const Load_login = async (req, res) => {
  try {
    res.render("User/login.ejs");
  } catch (error) {
    console.log("error while loadin loginpage", error);
  }
};

export const User_login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email: email });

    if (!userExist) {
      return res
        .status(404)
        .render("User/login.ejs", {
          message: "Please Provide email and password Correctly",
        });
    }

    if (userExist.isBlock) {
      return res
        .status(403)
        .render("User/login.ejs", { message: "Sorry, you are banned" });
    }

    const passwordMatch = await bcrypt.compare(password, userExist.password);

    if (passwordMatch) {
      req.session.UserEmail = userExist.email;
      req.session.UserId = userExist._id;
      req.session.isBlock = userExist.isBlock;

      return res
        .status(200)
        .render("User/dashboard.ejs", { message: "success===>" });
    } else {
      return res
        .status(401)
        .render("User/login.ejs", { message: "Invalid password" });
    }
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).send("Internal server error");
  }
};

export const Load_register = async (req, res) => {
  try {
    res.render("User/Register.ejs");
  } catch (error) {
    console.log("error while getting register page",error);
  }
};

export const User_Register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Validate all required fields
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).render("User/Register.ejs", {
          message:
            "Email already exists. Please login or use a different email.",
        });
      } else {
        req.session.userEmail = existingUser.email;
        // User exists but not verified; prompt OTP resend
        return res.status(400).render("User/otpverify.ejs", {
          message:
            "Email already registered but not verified. Check your email for OTP or resend the verification email.",
        });
      }
    }

    req.session.userEmail = email;
    let saltRound = 10;
    // Hash the password
    const hashPassword = await bcrypt.hash(password, saltRound);

    // Generate OTP and set expiration time
    const Otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Create and save new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashPassword,
      otp: Otp,
      otpExpiresAt,
      isActive: true,
      isVerified: false,
      created_at: Date.now().toString(),
    });

    await newUser.save();

    // Configure SMTP and send OTP email
    const smtpconfig = {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    const transport = nodemailer.createTransport(smtpconfig);
    const email_schema = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Confirmation",
      html: `<h1><b>${Otp}</b></h1> Please verify your email using this OTP.`,
    };

    await transport.sendMail(email_schema);

    // Guide user to OTP verification page
    res.status(201).render("User/otpverify.ejs");
  } catch (error) {
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).render("User/Register.ejs", {
        message: "Email already exists. Please login or use a different email.",
      });
    }

    // Handle any other errors
    res.status(500).json({ message: error.message });
  }
};

export const Resend_otp = async (req, res) => {
  try {
    const email = req.session.userEmail;

    if (!email) {
      return res.status(400).render("User/Register.ejs", {
        message: "Session expired. Please re-register or login again.",
      });
    }

    const user = await User.findOne({ email: req.session.userEmail });

    if (!user || user.isVerified) {
      return res.status(400).render("User/Register.ejs", {
        message: "User not found or already verified. Please login.",
      });
    }

    const newOtp = crypto.randomInt(100000, 999999).toString();
    const newOtpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpiresAt = newOtpExpiresAt;
    await user.save();

    // Send the new OTP via email
    const smtpconfig = {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    const transport = nodemailer.createTransport(smtpconfig);
    const email_schema = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resent OTP Confirmation",
      html: `<h1><b>${newOtp}</b></h1> Please verify your email using this OTP.`,
    };

    await transport.sendMail(email_schema);

    // Render the OTP verification page with a success message
    res.status(200).render("User/otpverify.ejs", {
      message:
        "A new OTP has been sent to your email. Please check and verify.",
      email, // Pass email to the verification page if needed
    });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const googleAuthCallback = async (
  accessToken,
  refreshToken,
  profile,
  done,
  req,
  res
) => {
  try {
    // Logic for finding or creating user in the database
    let existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    // Create a new user if not found
    const newUser = new user({
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      email: profile.emails[0].value,
      googleId: profile.id,
      isVerified: true,
    });
    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
};

export const verify_account = async (req, res) => {
  try {
    let { otp } = req.body;
    const email = req.session.userEmail; 

    if (Array.isArray(otp)) {
      otp = otp.join(""); // Join array elements into a single string
    }

    if (!otp || !email) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "OTP and email are required",
        success: false,
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).render("User/Register.ejs", {
        message: "User not found. Please register.",
        success: false,
      });
    }

    // Check if the OTP matches and hasn't expired
    if (user.otp !== otp) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "Invalid OTP. Please check and try again.",
        success: false,
      });
    }

    // Check if the OTP is expired
    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "OTP expired. Please resend the OTP.",
        success: false,
      });
    }

    // If valid, mark the user as verified
    user.isVerified = true;
    user.otp = null; // Clear the OTP
    user.otpExpiresAt = null; // Clear the OTP expiration
    await user.save();

    // Redirect or render success page
    res
      .status(200)
      .render("User/Register.ejs", {
        message: "Email verified successfully.please Login",
        success: true,
      });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res
      .status(500)
      .render("User/Register.ejs", {
        message: "Internal server error.",
        success: false,
      });
  }
};

export const User_Logout = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session = null;
      res.redirect("/"); // Redirect to the homepage after logout
    });
  } catch (error) {
    console.error(error);
  }
};

export const forgetPassword = async (req, res) => {
  try {
    res.render("User/forgetPassword.ejs");
  } catch (error) {
    console.log("error while getting forget password");
  }
};

export const VerifyForgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userExist = await User.findOne({ email: email });

    if (!userExist) {
      return res.render("User/forgetPassword.ejs", {
        message: `User ${email} not found`,
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    userExist.resetPasswordToken = hashedToken;
    userExist.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
    await userExist.save();

    // Cache the token and user ID
    tokenCache.set(resetToken, {
      userId: userExist._id,
      expires: userExist.resetPasswordExpires,
    });

    const resetURL = `http://localhost:4000/reset-password/${resetToken}`;

    const smtpConfig = {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    const transport = nodemailer.createTransport(smtpConfig);

    const emailSchema = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link will expire in 5 minutes.</p>
      `,
    };

    await transport.sendMail(emailSchema);

    res.render("User/forgetPassword.ejs", {
      message: `Link successfully sent to the ${email}`,
    });
  } catch (error) {
    console.log("error while verifying password", error);
    res
      .status(500)
      .render("User/forgetPassword.ejs", {
        message: "An error occurred. Please try again.",
      });
  }
};

const tokenCache = new Map();

const verifyToken = async (token) => {
  try {
    // Check if the token is cached
    if (tokenCache.has(token)) {
      return tokenCache.get(token);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      const failureResponse = {
        success: false,
        message: "Invalid or expired token.",
      };
      tokenCache.set(token, failureResponse); // Cache the failure response
      return failureResponse;
    }

    const successResponse = {
      success: true,
      email: user.email,
      message: "Successfully verified the email.",
    };
    tokenCache.set(token, successResponse); // Cache the success response
    return successResponse;
  } catch (error) {
    console.error("Error during token verification:", error);
    return { success: false, message: "An error occurred. Please try again." };
  }
};

export const ResetPasswordPage = async (req, res) => {
  const { token } = req.params;

  // Use the verifyToken function to process the token
  const result = await verifyToken(token);

  if (!result.success) {
    return res
      .status(400)
      .render("User/resetPassword.ejs", {
        message: result.message,
        token: token,
      });
  }

  res.render("User/resetPassword.ejs", {
    email: result.email,
    message: result.message,
  });
};

export const getResetpassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || !token) {
      return res
        .status(400)
        .render("User/resetPassword.ejs", {
          message: "Password and token are required.",
        });
    }

    // Verify the token using the cache
    const cachedTokenData = tokenCache.get(token);
    if (!cachedTokenData || Date.now() > cachedTokenData.expires) {
      return res
        .status(400)
        .render("User/resetPassword.ejs", {
          message: "Invalid or expired token.",
        });
    }

    // Retrieve the user from the database using userId stored in the cache
    const userId = cachedTokenData.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .render("User/resetPassword.ejs", { message: "User not found." });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // Clear the token from the cache
    tokenCache.delete(token);

    // Render success message or redirect to login page
    res
      .status(200)
      .render("User/login.ejs", {
        message: "Password reset successfully. Please login.",
      });
  } catch (error) {
    console.error("Error while resetting password:", error);
    res
      .status(500)
      .render("User/resetPassword.ejs", {
        message: "Internal server error. Please try again.",
      });
  }
};

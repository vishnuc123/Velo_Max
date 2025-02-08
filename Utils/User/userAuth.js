import User from "../../Models/User/UserDetailsModel.js";
import { hashPassword, comparePassword, generateOtp, sendEmail, verifyToken } from "../../Utils/User/userAuth.js";
import crypto from "crypto";

export const Load_login = async (req, res) => {
  try {
    res.render("User/login.ejs");
  } catch (error) {
    console.log("Error while loading login page", error);
  }
};

export const User_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExist = await User.findOne({ email });

    if (!userExist) {
      return res.status(404).render("User/login.ejs", { message: "User not found" });
    }

    if (userExist.isBlock) {
      return res.status(403).render("User/login.ejs", { message: "Sorry, you are banned" });
    }

    const passwordMatch = await comparePassword(password, userExist.password);

    if (passwordMatch) {
      req.session.UserEmail = userExist.email;
      req.session.UserId = userExist._id;
      req.session.isBlock = userExist.isBlock;

      return res.status(200).render("User/dashboard.ejs", { message: "Login successful" });
    } else {
      return res.status(401).render("User/login.ejs", { message: "Invalid password" });
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
    console.log(error);
  }
};

export const User_Register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).render("User/Register.ejs", {
          message: "Email already exists. Please login or use a different email.",
        });
      } else {
        req.session.userEmail = existingUser.email;
        return res.status(400).render("User/otpverify.ejs", {
          message: "Email already registered but not verified. Check your email for OTP or resend the verification email.",
        });
      }
    }

    req.session.userEmail = email;
    const hashedPassword = await hashPassword(password);
    const Otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      otp: Otp,
      otpExpiresAt,
      isActive: true,
      isVerified: false,
      created_at: Date.now().toString(),
    });

    await newUser.save();

    const htmlContent = `<h1><b>${Otp}</b></h1> Please verify your email using this OTP.`;
    await sendEmail(email, "OTP Confirmation", htmlContent);

    res.status(201).render("User/otpverify.ejs");
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).render("User/Register.ejs", {
        message: "Email already exists. Please login or use a different email.",
      });
    }
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

    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.status(400).render("User/Register.ejs", {
        message: "User not found or already verified. Please login.",
      });
    }

    const newOtp = generateOtp();
    const newOtpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpiresAt = newOtpExpiresAt;
    await user.save();

    const htmlContent = `<h1><b>${newOtp}</b></h1> Please verify your email using this OTP.`;
    await sendEmail(email, "Resent OTP Confirmation", htmlContent);

    res.status(200).render("User/otpverify.ejs", {
      message: "A new OTP has been sent to your email. Please check and verify.",
    });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const googleAuthCallback = async (accessToken, refreshToken, profile, done) => {
  try {
    let existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
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
      otp = otp.join("");
    }

    if (!otp || !email) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "OTP and email are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).render("User/Register.ejs", {
        message: "User not found. Please register.",
        success: false,
      });
    }

    if (user.otp !== otp) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "Invalid OTP. Please check and try again.",
        success: false,
      });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "OTP expired. Please resend the OTP.",
        success: false,
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).render("User/Register.ejs", { message: "Email verified successfully. Please login.", success: true });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).render("User/Register.ejs", { message: "Internal server error.", success: false });
  }
};

export const User_Logout = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  } catch (error) {
    console.error(error);
  }
};

export const forgetPassword = async (req, res) => {
  try {
    res.render('User/forgetPassword.ejs');
  } catch (error) {
    console.log("Error while loading forget password page:", error);
  }
};

export const VerifyForgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userExist = await User.findOne({ email });

    if (!userExist) {
      return res.render('User/forgetPassword.ejs', { message: `User ${email} not found` });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(resetToken);

    userExist.resetPasswordToken = hashedToken;
    userExist.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
    await userExist.save();

    const resetURL = `http://velomax.vishnuc.site/reset-password/${resetToken}`;

    const htmlContent = `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>This link will expire in 5 minutes.</p>
    `;

    await sendEmail(email, "Password Reset Request", htmlContent);

    res.render("User/forgetPassword.ejs", { message: `Link successfully sent to ${email}` });
  } catch (error) {
    console.log("Error while verifying forget password:", error);
    res.status(500).render("User/forgetPassword.ejs", { message: "An error occurred. Please try again." });
  }
};

export const ResetPasswordPage = async (req, res) => {
  const { token } = req.params;

  const result = await verifyToken(token, tokenCache, User);

  if (!result.success) {
    return res.status(400).render('User/resetPassword.ejs', { message: result.message, token });
  }

  res.render('User/resetPassword.ejs', { email: result.email, message: result.message });
};

export const ResetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  const result = await verifyToken(token, tokenCache, User);

  if (!result.success) {
    return res.status(400).render('User/resetPassword.ejs', { message: result.message, token });
  }

  const hashedPassword = await hashPassword(password);

  await User.findOneAndUpdate(
    { email: result.email },
    { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
    { new: true }
  );

  res.render('User/resetPassword.ejs', { message: "Password reset successfully", email: result.email });
};

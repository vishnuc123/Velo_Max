import User from "../Models/User/UserDetailsModel.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import user from "../Models/User/UserDetailsModel.js";
dotenv.config();

export const Load_login = async (req, res) => {
  try {
    res.render("User/login.ejs");
    
  } catch (error) {
    console.log('error while loadin loginpage',error);
    
  }
};
export const User_login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({email:email});

    if (!userExist) {
      return res.status(404).render("User/login.ejs", { message: "User not found" });
    }

    if (userExist.isBlock) {
      return res.status(403).render("User/login.ejs", { message: "Sorry, you are banned" });
    }

    const passwordMatch = await bcrypt.compare(password, userExist.password);
    
    if (passwordMatch) {
      // req.session.UserEmailAddress = userExist.email;       
      return res.status(200).render("User/dashboard.ejs", { message: "success===>" });
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
  // Validate all required fields
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res
          .status(400)
          .render("User/Register.ejs", {
            message:
              "Email already exists. Please login or use a different email.",
          });
        // message: "Email already exists. Please login or use a different email.",
      } else {
        req.session.email = existingUser.email;
        // If the user exists but is not verified, you can re-send the OTP
        return res
          .status(400)
          .render("User/otpverify.ejs", {
            message:
              "Email already registered but not verified. Check your email for OTP or resend the verification email.",
          });
        // message: "Email already registered but not verified. Check your email for OTP or resend the verification email.",
      }
    }

    req.session.email = email;
    console.log(req.session.email);
    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const Otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Create new user object
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

    // Save the new user in the database
    await newUser.save();

    // Send OTP via email
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

    // Return success message and guide the user to OTP verification page

    res.status(201).render("User/otpverify.ejs");
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res
        .status(400)
        .render("/Register", {
          message:
            "Email already exists. Please login or use a different email.",
        });
      // message: "Email already exists. Please login or use a different email.",
    }

    // Handle any other errors
    res.status(500).json({ message: error.message });
  }
};
export const Resend_otp = async (req, res) => {
  try {
    // Retrieve the email from the session
    const email = req.session.email;
    console.log(email);

    // Check if email exists in the session
    if (!email) {
      return res.status(400).render("User/Register.ejs", {
        message: "Session expired. Please re-register or login again.",
      });
    }

    // Find the user in the database
    const user = await User.findOne({ email: req.session.email });

    // Check if the user is not found or is already verified
    if (!user || user.isVerified) {
      return res.status(400).render("User/Register.ejs", {
        message: "User not found or already verified. Please login.",
      });
    }

    // Generate a new OTP and expiration time
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const newOtpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Update the OTP and expiration time in the user document
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
    const email = req.session.email; // Get the email from the session

    console.log(email);
    if (Array.isArray(otp)) {
      otp = otp.join(""); // Join array elements into a single string
    }
    console.log(otp);

    if (!otp || !email) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "OTP and email are required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).render("User/Register.ejs", {
        message: "User not found. Please register.",
      });
    }

    // Check if the OTP matches and hasn't expired
    if (user.otp !== otp) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "Invalid OTP. Please check and try again.",
      });
    }

    // Check if the OTP is expired
    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).render("User/otpverify.ejs", {
        message: "OTP expired. Please resend the OTP.",
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
      .render("User/Register.ejs", { message: "Email verified successfully." });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const get_dashboard = async (req, res) => {
  try {
    res.render("User/dashboard.ejs");
  } catch (error) {
    console.error("error while getting dashboard", error);
  }
};

export const Load_dashboard = async (req, res) => {
  res.render("User/dashboard.ejs");
};

export const User_Logout = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/"); // Redirect to the homepage after logout
    });
  } catch (error) {
    console.error(error);
  }
};

export const Load_products = async (req, res) => {
  try {
    res.render("User/ProductList.ejs");
  } catch (error) {
    console.error("error while loading products page", error);
  }
};

export const Load_productDetail = async (req, res) => {
  try {
    console.log(req.query.ProductId);
    res.render("User/productDetail.ejs");
  } catch (error) {
    console.log("error while loading productDetail page", error);
  }
};

import dotenv from "dotenv";
import errorHandler from "../../Error-Reporter.js";
dotenv.config();



// Authentication
export const Load_Admin = async (req, res, next) => {
  res.render("Admin/AdminLogin.ejs");
};

export const Login_admin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      process.env.credential_email === email &&
      process.env.credential_password === password
    ) {
      req.session.email = email;
      res.json({ success: true, message: "Login successful", redirect: "/dashboard" });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    next(error);
  }
};

export const Logout_Admin = async (req, res, next) => {
  req.session.email = null;
  res.redirect("/admin");
};

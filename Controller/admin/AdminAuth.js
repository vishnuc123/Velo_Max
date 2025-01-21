import dotenv from "dotenv";
import errorHandler from "../../Error-Reporter.js";
dotenv.config();



// Authentication
export const Load_Admin = async (req, res, next) => {
  res.render("Admin/AdminLogin.ejs");
};

export const Login_admin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (
    process.env.credential_email === email &&
    process.env.credential_password === password
  ) {
    req.session.email = email;
    res.redirect("/dashboard");
  } else {
    const error = new Error("Invalid email or password");
    error.status = 401; // Unauthorized
    next(error); // Pass the error to the error handler
  }
};

export const Logout_Admin = async (req, res, next) => {
  req.session.email = null;
  res.redirect("/admin");
};

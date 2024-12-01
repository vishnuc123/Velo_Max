import dotenv from "dotenv";
dotenv.config();

import { dirname } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));









// Authentication
export const Load_Admin = async (req, res) => {
    res.render("Admin/AdminLogin.ejs");
  };
  


  
  export const Login_admin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (
      process.env.credential_email == email &&
      process.env.credential_password === password
    ) {
      req.session.email = email;
      res.redirect("/dashboard");
    }
  };

  


  export const Logout_Admin = async (req, res) => {
    try {
      req.session.email = null;
      res.redirect("/admin");
    } catch (error) {
      console.log(error);
    }
  };
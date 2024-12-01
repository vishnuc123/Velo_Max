import User from "../../Models/User/UserDetailsModel.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import user from "../../Models/User/UserDetailsModel.js";
dotenv.config();





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
  
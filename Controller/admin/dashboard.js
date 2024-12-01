import dotenv from "dotenv";
dotenv.config();
import User from "../../Models/User/UserDetailsModel.js";
import Category from "../../Models/Admin/category.js";
import mongoose from "mongoose";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import prettier from "prettier";
import fs from "fs/promises";
import category from "../../Models/Admin/category.js";
import { title } from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));








export const Load_dashboard = async (req, res) => {
    res.render("Admin/dashboard.ejs");
  };
  
  
  export const Load_Ecommerce = async (req, res) => {
    try {
      res.render("Admin/ecommerse.ejs");
    } catch (error) {
      console.log(error);
    }
  };
  
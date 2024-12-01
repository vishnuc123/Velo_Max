import User from "../../Models/User/UserDetailsModel.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import user from "../../Models/User/UserDetailsModel.js";
dotenv.config();




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
  
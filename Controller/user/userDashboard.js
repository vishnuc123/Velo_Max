
import dotenv from "dotenv";
dotenv.config();

import category from "../../Models/Admin/category.js";




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
  

 
   export const Category_details = async (req, res) => {
    try {
      const data = await category.find({ isblocked: false });  // Filter for unblocked categories
    
      res.json({ data });
    } catch (error) {
      console.error("Error while getting category details from the database:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
import dotenv from "dotenv";
dotenv.config();



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
  
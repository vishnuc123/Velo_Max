import dotenv from "dotenv";
dotenv.config();



export const Load_dashboard = async (req, res) => {
  try {
      res.render("Admin/dashboard.ejs");
      
    } catch (error) {
      console.log('error while adding the dashboard',error);
      
    }
  };
  
  
  export const Load_Ecommerce = async (req, res) => {
    try {
      res.render("Admin/ecommerse.ejs");
    } catch (error) {
      console.log(error);
    }
  };
  
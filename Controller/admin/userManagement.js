import dotenv from "dotenv";
dotenv.config();
import User from "../../Models/User/UserDetailsModel.js";
import { dirname } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));









// menu-items

export const Load_UserManage = async (req, res) => {
    try {
      res.render("Admin/User-List.ejs");
    } catch (error) {
      console.log("error while fetching", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  };
  export const send_data = async (req, res) => {
    try {
      const userData = await User.find();
  
      res.json(userData);
    } catch (error) {
      console.log(error);
    }
  };
  
  export const User_isActive = async (req, res) => {
    try {
      const userId = req.params.id;
      const { status } = req.body;
  
      // Find user and update status in your database (e.g., MongoDB)
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: status },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "User status updated successfully", user });
    } catch (error) {
      console.error("Error while finding user_id for isActive:", error);
      res.status(500).json({ message: "Error updating user status" });
    }
  };
  
  export const update_userBlock = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const userData = await User.findById(userId);
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      userData.isBlock = !userData.isBlock;
  
      await userData.save();
      // console.log(userData);
      
  
      res.status(200).json({ message: 'User status updated', isBlocked: userData.isBlock });
    } catch (error) {
      console.log('Error while changing status of user: update_userstatus', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  export const update_userUnblock = async (req,res) => {
    try {
      const userId = req.params.userId;
      
      const userData = await User.findById(userId);
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      userData.isBlock = false;
  
      await userData.save();
      console.log(userData);
      
  
      res.status(200).json({ message: 'User status updated', isBlocked: userData.isBlock });
    } catch (error) {
      console.log('Error while changing status of user: update_userstatus', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  
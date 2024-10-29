import {Load_Admin,Login_admin,Load_dashboard,Logout_Admin, Load_Ecommerce,Load_UserManage,send_data,User_isActive,Load_Products,Load_Category,Add_Category,Category_details,get_formDetails,Add_Product} from '../../Controller/AdminController.js'
import { session_handle } from '../../Middlewares/Admin/Loginsession.js'; 
import express from "express";
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const admin_Route = express.Router()









admin_Route.use(cors())


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join( 'public', 'Admin', 'uploads'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
  
  const upload = multer({ storage: storage })
  




admin_Route.get('/admin',Load_Admin)
admin_Route.post('/admin',Login_admin)
admin_Route.get('/dashboard',session_handle,Load_dashboard)
admin_Route.get('/admin/logout',Logout_Admin)
admin_Route.get('/ecommerse-dashboard',Load_Ecommerce)

// user----section
admin_Route.get('/userManage',Load_UserManage)
admin_Route.get('/UserData',send_data)
admin_Route.patch('/userData/:id',User_isActive)


// Products----section
admin_Route.get('/products',Load_Products)



// Category----section
admin_Route.get('/category',Load_Category)
admin_Route.get('/category-details',Category_details)
admin_Route.post('/category',upload.single('category-image'),Add_Category)



// Product-------section
admin_Route.get('/products/:categoryId',get_formDetails)
admin_Route.post('/product/Addproduct',Add_Product)



export default admin_Route


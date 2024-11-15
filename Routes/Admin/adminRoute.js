import {Load_Admin,Login_admin,Load_dashboard,Logout_Admin, Load_Ecommerce,Load_UserManage,send_data,User_isActive,update_userBlock,update_userUnblock,Load_Products,Load_Category,Add_Category,Category_details,get_formDetails,Add_Product,get_productslist,editProduct,get_calculator,Category_unblock,Category_block,block_product,unblock_product} from '../../Controller/AdminController.js'
import { adminLoginSession , admindashboardSession } from '../../Middlewares/Admin/Loginsession.js'; 
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



const Routes = express.Router()









Routes.use(cors())


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
  
  const productStrorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join('public','Admin', 'uploads','products'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
  
  const productstoraging = multer.memoryStorage();
  export const productupload = multer({ productstoraging });  



Routes.get('/admin',admindashboardSession,Load_Admin)
Routes.post('/admin',Login_admin)
Routes.get('/dashboard',adminLoginSession,Load_dashboard)
Routes.get('/admin/logout',Logout_Admin)
Routes.get('/ecommerse-dashboard',Load_Ecommerce)

// user----section
Routes.get('/userManage',Load_UserManage)
Routes.get('/UserData',send_data)
Routes.patch('/userData/:id',User_isActive)
Routes.patch('/userBlock/:userId',update_userBlock)
Routes.patch('/userUnblock/:userId',update_userUnblock)


// Block----section


// Category----section
Routes.get('/category',Load_Category)
Routes.get('/category-details',Category_details)
Routes.patch('/category-details/:categoryId/block', Category_block);
Routes.patch('/category-details/:categoryId/unblock', Category_unblock);
Routes.post('/category',upload.single('category-image'),Add_Category)



// Product-------section
Routes.get('/products',Load_Products)
Routes.get('/products/:categoryId',get_formDetails)
Routes.post('/product/Addproduct/:categoryId',productupload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'additionalImage_0', maxCount: 1 },
  { name: 'additionalImage_1', maxCount: 1 },
  { name: 'additionalImage_2', maxCount: 1 },
  { name: 'additionalImage_3', maxCount: 1 },
]),Add_Product)

Routes.get('/product/listProduct',get_productslist)
Routes.patch('/product/editProduct/:productId/:categoryId',productupload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'additionalImage_0', maxCount: 1 },
  { name: 'additionalImage_1', maxCount: 1 },
  { name: 'additionalImage_2', maxCount: 1 },
  { name: 'additionalImage_3', maxCount: 1 },
]),editProduct)
Routes.patch('/product/:categoryId/:productId/unblock',unblock_product)
Routes.patch('/product/:categoryId/:productId/block',block_product)


// calculator
Routes.get('/calculator', get_calculator)


export default Routes


import {
  Load_Admin,
  Login_admin,
  Logout_Admin,
} from "../../Controller/admin/AdminAuth.js";
import {
  Load_UserManage,
  send_data,
  User_isActive,
  update_userBlock,
  update_userUnblock,
} from "../../Controller/admin/userManagement.js";
import {
  Load_dashboard,
  Load_Ecommerce,
} from "../../Controller/admin/dashboard.js";
import {
  Load_Products,
  Add_Product,
  get_productslist,
  editProduct,
  block_product,
  unblock_product,
} from "../../Controller/admin/productManagment.js";
import {
  Load_Category,
  Add_Category,
  Category_details,
  get_formDetails,
  Category_unblock,
  Category_block,
  editCategory,
  getEditCategory
} from "../../Controller/admin/categoryManagement.js";
import {
  adminLoginSession,
  admindashboardSession,
} from "../../Middlewares/Admin/Loginsession.js";
import { get_calculator } from "../../Controller/admin/calculator.js";
import { OrderListing,OrderView,orderUpdate } from "../../Controller/admin/orders.js";
import { getCouponsPage, addCoupon, getCouponsList } from "../../Controller/admin/coupons.js"



import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname equivalent in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Routes = express.Router();

Routes.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join("public", "Admin", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const productStrorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join("public", "Admin", "uploads", "products"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const productstoraging = multer.memoryStorage();
export const productupload = multer({ productstoraging });

Routes.get("/admin", admindashboardSession, Load_Admin);
Routes.post("/admin", Login_admin);
Routes.get("/admin/logout", Logout_Admin);
Routes.get("/dashboard", adminLoginSession, Load_dashboard);
Routes.get("/ecommerse-dashboard", adminLoginSession,Load_Ecommerce);

// user----section
Routes.get("/userManage", adminLoginSession,Load_UserManage);
Routes.get("/UserData",adminLoginSession, send_data);
Routes.patch("/userData/:id", User_isActive);
Routes.patch("/userBlock/:userId", update_userBlock);
Routes.patch("/userUnblock/:userId", update_userUnblock);

// Block----section

// Category----section
Routes.get("/category", adminLoginSession,Load_Category);
Routes.get("/category-details",adminLoginSession, Category_details);
Routes.patch("/category-details/:categoryId/block", Category_block);
Routes.patch("/category-details/:categoryId/unblock", Category_unblock);
Routes.post("/category", upload.single("category-image"), Add_Category);
Routes.patch('/category/:categoryId', upload.single('image'), editCategory);
Routes.get('/category-details/:categoryId',adminLoginSession,getEditCategory)

// Product-------section
Routes.get("/products",adminLoginSession, Load_Products);
Routes.get("/products/:categoryId",adminLoginSession, get_formDetails);
Routes.post(
  "/product/Addproduct/:categoryId",
  productupload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImage_0", maxCount: 1 },
    { name: "additionalImage_1", maxCount: 1 },
    { name: "additionalImage_2", maxCount: 1 },
    { name: "additionalImage_3", maxCount: 1 },
  ]),
  Add_Product
);

Routes.get("/product/listProduct", get_productslist);
Routes.patch(
  "/product/editProduct/:productId/:categoryId",
  productupload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImage_0", maxCount: 1 },
    { name: "additionalImage_1", maxCount: 1 },
    { name: "additionalImage_2", maxCount: 1 },
    { name: "additionalImage_3", maxCount: 1 },
  ]),
  editProduct
);
Routes.patch("/product/:categoryId/:productId/unblock", unblock_product);
Routes.patch("/product/:categoryId/:productId/block", block_product);

// calculator
Routes.get("/calculator",adminLoginSession, get_calculator);

// orders
Routes.get('/admin/orders/:OrderId',adminLoginSession,OrderView)
Routes.get('/admin/orders',adminLoginSession,OrderListing)
Routes.patch('/admin/orders/:orderId/update/:status',orderUpdate)



// coupons
Routes.get('/getCouponsPage',getCouponsPage)
Routes.post('/addCoupon',addCoupon)
Routes.get('/getCouponList',getCouponsList)

export default Routes;

import express from "express";
import cors from "cors";
import {
  upload,
  productUpload,
  productMemoryUpload,
} from "../../Utils/Admin/multer.js";

// Import controllers
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
  getTopTenProducts,
  getRecentOrders,
  getTopCategories,
  ledgerBook,
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
  getEditCategory,
} from "../../Controller/admin/categoryManagement.js";
import {
  adminLoginSession,
  admindashboardSession,
} from "../../Middlewares/Admin/Loginsession.js";
import { get_calculator } from "../../Controller/admin/calculator.js";
import {
  OrderListing,
  OrderView,
  orderUpdate,
} from "../../Controller/admin/orders.js";
import {
  getCouponsPage,
  addCoupon,
  getCouponsList,
  deleteCoupon,
} from "../../Controller/admin/coupons.js";
import {
  getOfferPage,
  searchProducts,
  addOffer,
  getofferDetails,
  deleteOffer,
} from "../../Controller/admin/offerManagement.js";
import { getSalesPage, getSalesDetails } from "../../Controller/admin/sales.js";
import {
  getInbox,
  getReturnRequests,
  acceptReturnRequest,
  rejectReturnRequest,
} from "../../Controller/admin/inbox.js";

const Routes = express.Router();

// Middleware for enabling CORS
Routes.use(cors());

// Admin routes
Routes.get("/admin", Load_Admin); // Load admin panel if session is valid
Routes.post("/admin", Login_admin); // Admin login
Routes.get("/admin/logout", Logout_Admin); // Admin logout
Routes.get("/dashboard", adminLoginSession, Load_dashboard); // Load admin dashboard

Routes.get("/ecommerse-dashboard", adminLoginSession, Load_Ecommerce); // Load ecommerce dashboard
// Route to get the top10 best selling product
Routes.get("/getTopTenProducts", getTopTenProducts);
// routes to get the recent orders
Routes.get("/getRecentOrders", getRecentOrders);
// ropute to get eh ledger book
Routes.get("/ledgerBook", ledgerBook);
// route to get the top categories
Routes.get("/getTopCategories", getTopCategories);

// User management routes
Routes.get("/userManage", adminLoginSession, Load_UserManage); // Load user management page
Routes.get("/UserData", adminLoginSession, send_data); // Get user data
Routes.patch("/userData/:id", User_isActive); // Update user active status
Routes.patch("/userBlock/:userId", update_userBlock); // Block a user
Routes.patch("/userUnblock/:userId", update_userUnblock); // Unblock a user

// Category management routes
Routes.get("/category", adminLoginSession, Load_Category); // Load category management page
Routes.get("/category-details", adminLoginSession, Category_details); // Get category details
Routes.patch("/category-details/:categoryId/block", Category_block); // Block a category
Routes.patch("/category-details/:categoryId/unblock", Category_unblock); // Unblock a category
Routes.post("/category", Add_Category); // Add a new category with image upload
Routes.patch("/category/:categoryId", editCategory); // Edit a category with image upload
Routes.get("/category-details/:categoryId", getEditCategory); // Get details for editing a category

// Product management routes
Routes.get("/products", adminLoginSession, Load_Products); // Load product management page
Routes.get("/products/:categoryId", adminLoginSession, get_formDetails); // Get form details for a specific category
Routes.post(
  "/product/Addproduct/:categoryId",
  Add_Product // Add a new product
);
Routes.get("/product/listProduct", get_productslist); // Get list of all products
Routes.patch(
  "/product/editProduct/:productId/:categoryId",
  editProduct // Edit a product
);
Routes.patch("/product/:categoryId/:productId/unblock", unblock_product); // Unblock a product
Routes.patch("/product/:categoryId/:productId/block", block_product); // Block a product

// Calculator route
Routes.get("/calculator", adminLoginSession, get_calculator); // Load calculator page

// Order management routes
Routes.get("/admin/orders/:OrderId", OrderView); // View specific order details
Routes.get("/admin/orders", adminLoginSession, OrderListing); // List all orders
Routes.patch("/admin/orders/:orderId/update/:status", orderUpdate); // Update order status

// Coupon management routes
Routes.get("/getCouponsPage", adminLoginSession, getCouponsPage); // Load coupons management page
Routes.post("/addCoupon", addCoupon); // Add a new coupon
Routes.get("/getCouponList", getCouponsList); // Get list of all coupons
Routes.delete("/deleteCoupon/:id", deleteCoupon); // Delete a coupon

/** Offer Management **/
// Route For getting the offer page
Routes.get("/getOfferPage", adminLoginSession, getOfferPage);
// Route for getting the product suggestion when product offer search
Routes.get("/searchProducts", searchProducts);
// Route to add the new offer to the category or product
Routes.post("/addOffer", addOffer);
// Route to get the details about the offers
Routes.get("/getOfferDetails", getofferDetails);
// Route to delete the offer
Routes.delete("/deleteOffer/:offerId", deleteOffer);

// Route to get the sales seperate page
Routes.get("/getSalesPage", adminLoginSession, getSalesPage);
// Route to get the sales report contents
Routes.get("/getsalesDetails", getSalesDetails);

// route to get the inbox for the return requests
Routes.get("/getinbox", adminLoginSession, getInbox);
// route get all return requests
Routes.get("/getReturnRequests", getReturnRequests);
// routes to get the all return request details
// Routes.get('/getReturnDetails',getReturnDetails)
// rout for accept return request
Routes.post("/acceptReturnRequest", acceptReturnRequest);
// route to reject thr return request
Routes.post("/rejectReturnRequest", rejectReturnRequest);

export default Routes;

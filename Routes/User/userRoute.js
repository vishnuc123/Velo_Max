import passport from "passport";
import {
  Load_login,
  User_login,
  Load_register,
  User_Register,
  verify_account,
  Resend_otp,
  User_Logout,
} from "../../Controller/user/userAuth.js";
import {
  Load_dashboard,
  get_dashboard,
} from "../../Controller/user/userDashboard.js";
import {
  Load_products,
  Load_productDetail,
  getProducts,
  filterProducts,
  searchProducts
} from "../../Controller/user/products.js";
import {
  session_handle,
  landingPageSession,
} from "../../Middlewares/User/loginSession.js";
import {load_buyNow} from "../../Controller/user/checkout.js"
import { addToCart ,getCartItems,removeCartItem,updateCartItems,getcartCheckout,cartItems,getProductDetails} from "../../Controller/user/addToCart.js";
import { loadAccount,loadAddress,loadOrders,loadWallet ,submitAddress,getAddresses, getUserDetails} from "../../Controller/user/account.js";
import { Category_details } from "../../Controller/user/userDashboard.js";
import { processPayment,getOrderSuccess } from "../../Controller/user/payment.js";
import { getOrders,getOrderProductDetail,validateOldPassword,submitAccountDetails } from "../../Controller/user/account.js";

import express from "express";
const Routes = express.Router();

Routes.use(express.urlencoded({ extended: false }));
Routes.use(express.json());

Routes.get("/", landingPageSession, Load_login);
Routes.post("/", User_login);
Routes.get("/Register", landingPageSession, Load_register);
Routes.post("/Register", User_Register);
Routes.get("/User/dashboard", session_handle, get_dashboard);
Routes.post("/verifyAccount", verify_account);
Routes.get("/resendOtp", Resend_otp);

Routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
Routes.get(
  "/google/authentication",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("User/dashboard");
  }
);
Routes.get("/google/User/dashboard", session_handle, Load_dashboard);
Routes.get("/logout", session_handle, User_Logout);



// product-list
Routes.get("/dashboard/products",session_handle,Load_products);
Routes.get("/getProducts",getProducts);
Routes.post('/dashboard/products/sortProducts',filterProducts)

Routes.get("/product-detail",session_handle,Load_productDetail);
// search for the products in productList
Routes.get('/search',searchProducts)

// category details
Routes.get("/dashboard/category-details", Category_details);

// productdetail tO BUY
Routes.get('/buynow/:categoryId/:productId',session_handle,load_buyNow)

// Cart
Routes.get('/getCartItems',getCartItems)
Routes.get('/getproductDetails/:categoryId/:productId',getProductDetails)
Routes.post('/addToCart/:categoryId/:productId',addToCart)
Routes.post('/updateCartItem',updateCartItems)
Routes.delete('/removeCartItem',removeCartItem)
Routes.get('/cartcheckout',getcartCheckout)
Routes.get('/cartItems',cartItems)


// Account Section
Routes.get('/account',session_handle,loadAccount)
Routes.get('/orders',session_handle,loadOrders)
Routes.get('/wallet',session_handle,loadWallet)
Routes.get('/address',session_handle,loadAddress)


// get user details
// Account passsword
Routes.get('/getuserdetails',getUserDetails)
Routes.post('/validate-old-password',session_handle, validateOldPassword)
Routes.post('/submit-accountDetails',submitAccountDetails)


Routes.post('/submit-address',submitAddress)
Routes.get('/get-address',getAddresses)


// payment
Routes.post('/process-payment',processPayment)
Routes.get('/orderSuccess',getOrderSuccess)


// get orders
Routes.get('/getOrders',getOrders)
Routes.get('/getOrderProductDetail',getOrderProductDetail)




export default Routes;

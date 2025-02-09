import express from "express";
import passport from "passport";
import {
  Load_login,
  User_login,
  Load_register,
  User_Register,
  verify_account,
  Resend_otp,
  User_Logout,
  forgetPassword,
  VerifyForgetPassword,
  ResetPasswordPage,
  getResetpassword,
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
  searchProducts,
} from "../../Controller/user/products.js";

import {
  session_handle,
  landingPageSession,
} from "../../Middlewares/User/loginSession.js";

import { load_buyNow } from "../../Controller/user/checkout.js";

import {
  addToCart,
  getCartItems,
  removeCartItem,
  updateCartItems,
  getcartCheckout,
  cartItems,
  getProductDetails,
  getCartCollectionData,
  getCartDetailedPage,
} from "../../Controller/user/addToCart.js";

import {
  loadAccount,
  loadAddress,
  loadOrders,
  loadWallet,
  submitAddress,
  getAddresses,
  getUserDetails,
  updateAddresses,
  deleteAddress,
} from "../../Controller/user/account.js";

import { Category_details } from "../../Controller/user/userDashboard.js";

import {
  processPayment,
  processCartPayment,
  getOrderSuccess,
  cancelOrder,
  paypalpayment,
  paypalCancel,
  paypalsuccess,
  cartPaypalpayment,
  repayPaypal,
} from "../../Controller/user/payment.js";

import {
  getOrders,
  getOrderProductDetail,
  getSpecificOrder,
  returnOrder,
  validateOldPassword,
  submitAccountDetails,
  editAccountName,
} from "../../Controller/user/account.js";

import { getCoupons, validateCoupon } from "../../Controller/user/coupons.js";

import {
  getWishlist,
  getWishlistProducts,
  addToWishlist,
  getWishlistItems,
  removeFromWishlist,
  checkWislist,
} from "../../Controller/user/wishlist.js";

import {
  walletStatus,
  getBalance,
  addMoneyToWallet,
  getAddMoneyPage,
  AddMoneySuccess,
  walletPayment,
  cartWalletPayment,
} from "../../Controller/user/wallet.js";
import { getInvoice } from "../../Controller/user/invoice.js";
import { getBrands } from "../../Controller/user/brands.js";
import { getAboutUs } from "../../Controller/user/aboutUs.js";



const Routes = express.Router();

// Middleware to parse request body
Routes.use(express.urlencoded({ extended: false }));
Routes.use(express.json());

/** Authentication Routes **/
// Load login page
Routes.get("/", landingPageSession, Load_login);
// Handle user login
Routes.post("/", User_login);
// Load registration page
Routes.get("/Register", landingPageSession, Load_register);
// Handle user registration
Routes.post("/Register", User_Register);
// Verify account with OTP
Routes.post("/verifyAccount", verify_account);
// Resend OTP for verification
Routes.get("/resendOtp", Resend_otp);
// Forget password page
Routes.get("/forgetPassword", forgetPassword);
// Verify forget password request
Routes.post("/VerifyForgetPassword", VerifyForgetPassword);
// Load reset password page
Routes.get("/reset-password/:token", ResetPasswordPage);
// Handle reset password form submission
Routes.post("/reset-password/:token", getResetpassword);

/** Google Authentication **/
// Initiate Google authentication
Routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// Handle Google authentication callback
Routes.get(
  "/google/authentication",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("Google authentication callback hit");
    req.session.UserId = req.user.id;
    req.session.email = req.user.email;
    req.session.isBlock = req.user.isBlock;
    res.redirect("/User/dashboard");
  }
);

/** User Dashboard and Logout **/
// Load user dashboard
Routes.get("/User/dashboard", landingPageSession, get_dashboard);
// Handle user logout
Routes.get("/logout", session_handle, User_Logout);

/** Product Routes **/
// Load product list page
Routes.get("/dashboard/products", session_handle, Load_products);
// Get all products
Routes.get("/getProducts", getProducts);
// Sort/filter products
Routes.post("/dashboard/products/sortProducts", filterProducts);
// Load product detail page
Routes.get("/product-detail", session_handle, Load_productDetail);
// Search products
Routes.get("/search", session_handle, searchProducts);
// Load category details
Routes.get("/dashboard/category-details", session_handle, Category_details);
// Load buy now page for a product
Routes.get("/buynow/:categoryId/:productId", session_handle, load_buyNow);

/** Cart Routes **/
// Get cart items
Routes.get("/getCartItems", getCartItems);
// Get product details for cart
Routes.get("/getproductDetails/:categoryId/:productId", getProductDetails);
// Add item to cart
Routes.post("/addToCart/:categoryId/:productId", addToCart);
// Update cart item quantity
Routes.post("/updateCartItem", updateCartItems);
// Remove item from cart
Routes.delete("/removeCartItem", removeCartItem);
// Checkout cart
Routes.get("/cartcheckout", session_handle, getcartCheckout);
// Get cart summary
Routes.get("/cartItems", cartItems);
// Get cart collection data
Routes.get("/cartdata", getCartCollectionData);
// Get detailed cart page
Routes.get("/cartDetailedPage", session_handle, getCartDetailedPage);

/** Account Routes **/
// Load account details
Routes.get("/account", session_handle, loadAccount);
// Load user orders
Routes.get("/orders", session_handle, loadOrders);
// Load user wallet
Routes.get("/wallet", session_handle, loadWallet);
// Load user addresses
Routes.get("/address", session_handle, loadAddress);
// Get user details
Routes.get("/getuserdetails", getUserDetails);
// Validate old password
Routes.post("/validate-old-password", validateOldPassword);
// Submit account details
Routes.post("/submit-accountDetails", submitAccountDetails);
// Edit account name
Routes.post("/submit-AccountName", editAccountName);
// Submit a new address
Routes.post("/submit-address", submitAddress);
// Get all addresses
Routes.get("/get-address", getAddresses);
// Update an address
Routes.put("/update-address/:addressId", updateAddresses);
// Delete an address
Routes.delete("/delete-address/:addressId", deleteAddress);

/** Payment Routes **/
// Process payment
Routes.post("/process-payment", processPayment);
// Process cart payment
Routes.post("/cart-process-payment", processCartPayment);
// Order success page
Routes.get("/orderSuccess/:orderId", session_handle, getOrderSuccess);
// PayPal payment process
Routes.post("/process-paypal-payment", paypalpayment);
Routes.post("/cart-process-paypal-payment", cartPaypalpayment);
// PayPal cancel and success
Routes.get("/paypalcancel", paypalCancel);
Routes.get("/paypalsuccess", paypalsuccess);
// get repay paypal
Routes.post("/repayPaypal", repayPaypal);

/** Order Routes **/
// Get user orders
Routes.get("/getOrders", getOrders);
// Get order product details
Routes.get("/getOrderProductDetail", getOrderProductDetail);
// Cancel an order
Routes.post("/cancelOrder", cancelOrder);
// Return an order
Routes.post("/returnOrder", returnOrder);
// get specific order
Routes.get("/getSpecificOrder/:orderId", getSpecificOrder);

/** Coupon Routes **/
// Get available coupons
Routes.get("/getCoupons", getCoupons);
// Validate a coupon
Routes.post("/validate-coupon", validateCoupon);

/** Wishlist Routes **/
// Get wishlist page
Routes.get("/getwishlist", session_handle, getWishlist);
// Get products in wishlist
Routes.get("/getWishlistProducts", getWishlistProducts);
// Add product to wishlist
Routes.post("/addToWishlist", addToWishlist);
// whislist items
Routes.get("/getWishlistItems", getWishlistItems);
// check the product is in the whislist or not
Routes.get("/checkwishlist/:productId", checkWislist);
// removing from the whislist
Routes.delete("/removeFromWishlist/:productId", removeFromWishlist);

/** wallet Routes **/
// Route for check wallet is unlocked or not
Routes.post("/walletStatus", walletStatus);
// route for the getting wallet details from the database
Routes.get("/getWalletDetails", getBalance);
// getting addmoney page
Routes.get("/getAddMoneyPage", session_handle, getAddMoneyPage);
Routes.post("/addMoney", addMoneyToWallet);
// paypal addmoney success
Routes.get("/paypal/AddMoneySuccess", AddMoneySuccess);
// Payment Through the Paypal
Routes.post("/process-wallet-payment", walletPayment);
// cart wallet payment
Routes.post("/process-cart-wallet-payment", cartWalletPayment);

/** invoice */
// Route for getting invoice
Routes.get("/getInvoice/:orderId", getInvoice);


// brands
Routes.get('/brands',session_handle,getBrands)

Routes.get('/aboutUs',session_handle,getAboutUs)



export default Routes;

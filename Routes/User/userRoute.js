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
  getResetpassword
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
import { addToCart ,getCartItems,removeCartItem,updateCartItems,getcartCheckout,cartItems,getProductDetails,getCartCollectionData,getCartDetailedPage} from "../../Controller/user/addToCart.js";
import { loadAccount,loadAddress,loadOrders,loadWallet ,submitAddress,getAddresses, getUserDetails,updateAddresses,deleteAddress} from "../../Controller/user/account.js";
import { Category_details } from "../../Controller/user/userDashboard.js";
import { processPayment,processCartPayment,getOrderSuccess,cancelOrder,paypalpayment,paypalCancel,paypalsuccess,cartPaypalpayment } from "../../Controller/user/payment.js";
import { getOrders,getOrderProductDetail,returnOrder,validateOldPassword,submitAccountDetails,editAccountName } from "../../Controller/user/account.js";
import { getCoupons, validateCoupon } from "../../Controller/user/coupons.js"
import { getWishlist,getWishlistProducts,addToWishlist } from "../../Controller/user/wishlist.js"



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
Routes.get('/forgetPassword',session_handle,forgetPassword)
Routes.post('/VerifyForgetPassword',VerifyForgetPassword)
Routes.get('/reset-password/:token',session_handle,ResetPasswordPage)
Routes.post('/reset-password/:token',getResetpassword)

Routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
Routes.get(
  "/google/authentication",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // After successful authentication, store session data
    req.session.UserId = req.user.id;          // Store user ID in session
    req.session.email = req.user.email;        // Store email in session
    req.session.isBlock = req.user.isBlock;    // Store isBlock status in session

    // Redirect to the user's dashboard
    res.redirect("/User/dashboard");
  }
);

// Routes.get("/google/User/dashboard", session_handle, Load_dashboard);
Routes.get("/logout", session_handle, User_Logout);



// product-list
Routes.get("/dashboard/products",session_handle,Load_products);
Routes.get("/getProducts",getProducts);
Routes.post('/dashboard/products/sortProducts',filterProducts)

Routes.get("/product-detail",session_handle,Load_productDetail);
// search for the products in productList
Routes.get('/search',session_handle,searchProducts)

// category details
Routes.get("/dashboard/category-details",session_handle, Category_details);

// productdetail tO BUY
Routes.get('/buynow/:categoryId/:productId',session_handle,load_buyNow)

// Cart
Routes.get('/getCartItems',getCartItems)
Routes.get('/getproductDetails/:categoryId/:productId',getProductDetails)
Routes.post('/addToCart/:categoryId/:productId',addToCart)
Routes.post('/updateCartItem',updateCartItems)
Routes.delete('/removeCartItem',removeCartItem)
Routes.get('/cartcheckout',session_handle,getcartCheckout)
Routes.get('/cartItems',cartItems)
Routes.get('/cartdata',getCartCollectionData)
Routes.get('/cartDetailedPage',session_handle,getCartDetailedPage)


// Account Section
Routes.get('/account',session_handle,loadAccount)
Routes.get('/orders',session_handle,loadOrders)
Routes.get('/wallet',session_handle,loadWallet)
Routes.get('/address',session_handle,loadAddress)


// get user details
// Account passsword
Routes.get('/getuserdetails',getUserDetails)
Routes.post('/validate-old-password', validateOldPassword)
Routes.post('/submit-accountDetails',submitAccountDetails)
// account name
Routes.post('/submit-AccountName',editAccountName)


//  adddress handling sectiion
Routes.post('/submit-address',submitAddress)
Routes.get('/get-address',getAddresses)
Routes.put('/update-address/:addressId',updateAddresses)
Routes.delete('/delete-address/:addressId',deleteAddress)


// payment
Routes.post('/process-payment',processPayment)
Routes.post('/cart-process-payment',processCartPayment)
Routes.get('/orderSuccess/:orderId',session_handle,getOrderSuccess)

// paypal
Routes.post('/process-paypal-payment', paypalpayment);
Routes.post('/cart-process-paypal-payment', cartPaypalpayment);
Routes.get('/paypalcancel', paypalCancel);
Routes.get('/paypalsuccess', paypalsuccess); // Update this from paypalCancel



// get orders
Routes.get('/getOrders',getOrders)
Routes.get('/getOrderProductDetail',getOrderProductDetail)
Routes.post('/cancelOrder',cancelOrder)
Routes.post('/returnOrder',returnOrder)


// getcoupons
Routes.get('/getCoupons',getCoupons)
Routes.post('/validate-coupon',validateCoupon)

// whislist
Routes.get('/getwishlist',session_handle,getWishlist)
Routes.get('/getWishlistProducts',getWishlistProducts)
Routes.post('/addToWishlist',addToWishlist)


export default Routes;

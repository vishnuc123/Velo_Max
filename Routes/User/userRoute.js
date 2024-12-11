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
import { addToCart ,getCartItems,removeCartItem,updateCartItems,getcartCheckout,cartItems,getProductDetails,getCartCollectionData} from "../../Controller/user/addToCart.js";
import { loadAccount,loadAddress,loadOrders,loadWallet ,submitAddress,getAddresses, getUserDetails,updateAddresses,deleteAddress} from "../../Controller/user/account.js";
import { Category_details } from "../../Controller/user/userDashboard.js";
import { processPayment,processCartPayment,getOrderSuccess,cancelOrder } from "../../Controller/user/payment.js";
import { getOrders,getOrderProductDetail,validateOldPassword,submitAccountDetails,editAccountName } from "../../Controller/user/account.js";
import { getCoupons, validateCoupon } from "../../Controller/user/coupons.js"



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

Routes.get("/product-detail",Load_productDetail);
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



Routes.post('/submit-address',submitAddress)
Routes.get('/get-address',getAddresses)
Routes.put('/update-address/:addressId',updateAddresses)
Routes.delete('/delete-address/:addressId',deleteAddress)


// payment
Routes.post('/process-payment',processPayment)
Routes.post('/cart-process-payment',processCartPayment)
Routes.get('/orderSuccess',getOrderSuccess)


// get orders
Routes.get('/getOrders',session_handle,getOrders)
Routes.get('/getOrderProductDetail',getOrderProductDetail)
Routes.post('/cancelOrder',cancelOrder)


// getcoupons
Routes.get('/getCoupons',getCoupons)
Routes.post('/validate-coupon',validateCoupon)




export default Routes;

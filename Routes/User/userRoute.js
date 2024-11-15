import passport from 'passport';
import {Load_login,User_login,Load_register,User_Register,Load_dashboard,User_Logout,Load_products , verify_account, get_dashboard, Resend_otp,Load_productDetail} from '../../Controller/UserController.js'
import { session_handle ,landingPageSession}  from "../../Middlewares/User/loginSession.js"
import express from "express";
const Routes = express.Router()




Routes.use(express.urlencoded({extended:false}))
Routes.use(express.json())








Routes.get('/',landingPageSession,Load_login)
Routes.post('/',User_login)
Routes.get('/Register',landingPageSession,Load_register)
Routes.post('/Register',User_Register)
Routes.get('/User/dashboard',session_handle,get_dashboard)
Routes.post('/verifyAccount',verify_account)
Routes.get('/resendOtp',Resend_otp)

Routes.get('/google',passport.authenticate('google',{scope:['profile','email']}))
Routes.get('/google/authentication',passport.authenticate('google',{failureRedirect:'/'}),(req,res)=>{
    res.redirect('User/dashboard')
})
Routes.get('/google/User/dashboard',session_handle,Load_dashboard)
Routes.get('/logout',session_handle,User_Logout)


Routes.get('/dashboard/products',Load_products)



Routes.get('/product-detail',Load_productDetail)





export default Routes
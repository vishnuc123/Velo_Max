import passport from 'passport';
import {Load_login,User_login,Load_register,User_Register,Load_dashboard,User_Logout,Load_products , verify_account, get_dashboard, Resend_otp,Load_productDetail} from '../../Controller/UserController.js'
import { session_handle}  from "../../Middlewares/User/loginSession.js"
import express from "express";
const User_route = express.Router()




User_route.use(express.urlencoded({extended:false}))
User_route.use(express.json())








User_route.get('/',Load_login)
User_route.post('/',User_login)
User_route.get('/Register',Load_register)
User_route.post('/Register',User_Register)
User_route.get('/User/dashboard',get_dashboard)
User_route.post('/verifyAccount',verify_account)
User_route.get('/resendOtp',Resend_otp)

User_route.get('/google',passport.authenticate('google',{scope:['profile','email']}))
User_route.get('/google/authentication',passport.authenticate('google',{failureRedirect:'/'}),(req,res)=>{
    res.redirect('User/dashboard')
})
User_route.get('/google/User/dashboard',session_handle,Load_dashboard)
User_route.get('/logout',User_Logout)


User_route.get('/dashboard/products',Load_products)



User_route.get('/product-detail',Load_productDetail)




export default User_route
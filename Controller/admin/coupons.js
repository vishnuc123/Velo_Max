
import Coupon from "../../Models/Admin/coupon.js"

export const getCouponsPage = async (req,res) => {
    try {
        res.render('Admin/coupon.ejs')
    } catch (error) {
        console.log("error while getting coupon page");
        
    }
}


export const addCoupon = async (req, res) => {
    try {
        // Extract data from request body
        const { 
            code, 
            discountType, 
            discountAmount, 
            minPrice, 
            maxPrice, 
            startDate, 
            endDate, 
            usageLimit, 
            usageLimitPerUser, 
        } = req.body;
        console.log(req.body);
        

        // Create a new coupon instance with the received data
        const newCoupon = Coupon({
            code,
            discountType,
            discountValue:discountAmount,
            minPurchaseAmount:minPrice,
            maxPurchaseAmount:maxPrice,
            startDate,
            endDate,
            usageLimit,
            usageLimitPerUser
        });

        // Save the coupon to the database
        await newCoupon.save();

        // Respond to the client indicating the coupon was successfully created
        res.status(201).json({ message: 'Coupon created successfully!', coupon: newCoupon });
        
    } catch (error) {
        console.error("Error while submitting the coupon details", error);
        res.status(500).json({ message: 'Failed to create coupon. Please try again.' });
    }
};

export const getCouponsList = async (req,res) => {
    try {
        const coupons = await Coupon.find()
        // console.log(coupons);
        
        res.status(200).json({coupons:coupons})
    } catch (error) {
        console.log("error while getting coupons list");
        
    }
}

export const deleteCoupon  = async (req,res) => {
    try {
        const couponId = req.params.id;
        const coupondetails = await Coupon.findByIdAndDelete(couponId)       
        res.status(200).json({message:"coupon deleted successfully",coupondetails:coupondetails}) 
    } catch (error) {
        console.log("error while deleting the coupon");
        
    }
}
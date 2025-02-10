import Coupons from "../../Models/Admin/coupon.js"

export const getCoupons = async (req, res) => {
    try {
        const currentDate = new Date();

    
        const coupons = await Coupons.find({
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            $expr: { $lt: ["$usedCount", "$usageLimit"] } 
        });

        res.status(200).json({ coupons });
    } catch (error) {
        console.error("Error while getting coupons:", error);
        res.status(500).json({ message: "Error while fetching coupons" });
    }
};


export const validateCoupon = async (req, res) => {
    try {
        const { coupon,totalPrice } = req.body;
        
        

        if (!coupon) {
            return res.status(400).json({ isValid: false, message: "Coupon code is required" });
        }

        const couponRecord = await Coupons.findOne({ code: coupon });

        if (!couponRecord) {
            return res.status(404).json({ isValid: false, message: "Invalid or expired coupon code" });
        }

        const currentDate = new Date();
        const isWithinDateRange =
            currentDate >= new Date(couponRecord.startDate) && currentDate <= new Date(couponRecord.endDate);

        if (!couponRecord.isActive || !isWithinDateRange) {
            return res.status(400).json({ isValid: false, message: "Coupon is not valid or expired" });
        }

        if (couponRecord.usedCount >= couponRecord.usageLimit) {
            return res.status(400).json({ isValid: false, message: "Coupon usage limit reached" });
        }
        if(couponRecord.minPurchaseAmount>=totalPrice || couponRecord.maxPurchaseAmount<=totalPrice){
            return res.status(500).json({message:"Coupons is not valid for these Price" ,isValid:false})
        }

        return res.status(200).json({ isValid: true, message: "Coupon is valid", couponRecord });

    } catch (error) {
        console.error("Error while validating coupon:", error);
        return res.status(500).json({ isValid: false, message: "Internal server error" });
    }
};

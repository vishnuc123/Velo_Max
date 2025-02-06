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
        const { coupon } = req.body;

        // Check if the coupon is provided
        if (!coupon) {
            return res.status(400).json({ isValid: false, message: "Coupon code is required" });
        }

        // Search for the coupon in the database
        const couponRecord = await Coupons.findOne({ code: coupon });

        // If no matching coupon found
        if (!couponRecord) {
            return res.status(404).json({ isValid: false, message: "Invalid or expired coupon code" });
        }

        // Check if the coupon is active and within the validity date range
        const currentDate = new Date();
        const isWithinDateRange =
            currentDate >= new Date(couponRecord.startDate) && currentDate <= new Date(couponRecord.endDate);

        if (!couponRecord.isActive || !isWithinDateRange) {
            return res.status(400).json({ isValid: false, message: "Coupon is not valid or expired" });
        }

        // Check if the usage limit is reached
        if (couponRecord.usedCount >= couponRecord.usageLimit) {
            return res.status(400).json({ isValid: false, message: "Coupon usage limit reached" });
        }

        // If valid coupon
        return res.status(200).json({ isValid: true, message: "Coupon is valid", couponRecord });

    } catch (error) {
        console.error("Error while validating coupon:", error);
        return res.status(500).json({ isValid: false, message: "Internal server error" });
    }
};

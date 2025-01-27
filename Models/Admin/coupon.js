import mongoose from 'mongoose';
import { deactivateCouponMiddleware } from '../../Middlewares/Admin/deActivateCoupon.js';

// Define the coupon schema
const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    minPurchaseAmount: {
        type: Number,
        default: 0,
    },
    maxPurchaseAmount: {
        type: Number,
        default: null,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: null,
    },
    usageLimitPerUser: {
        type: Number,
        default: null,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

deactivateCouponMiddleware(couponSchema)

// Define the model using the schema
const Coupon = mongoose.model('Coupon', couponSchema);

// Export the model
export default Coupon;

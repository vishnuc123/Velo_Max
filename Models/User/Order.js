import mongoose from "mongoose";
import { type } from "os";



const ordersSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    orderedItem : [{
        categoryId: { 
            type: String,
            required: true 
        },
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true, 
            default: 1 
        },
        DiscountAmount:{
            type:Number,
            default:null
        },
        actualPrice:{
            type:Number,
            default:0
        },
        offerName:{
        type:String,
        default:null
        },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Delivered', 'Cancelled', 'Returned','Return-pending','Return-accepted','Return-Rejected'],
            default: 'Pending',
          },

        totalPrice: { 
            type: Number, 
            required: true 
        },
        returnRequest: {
            status: {
              type: String,
              enum: ['Pending', 'Accepted', 'Rejected'],
            },
            reason: {
              type: String,
            },
            requestedAt: {
              type: Date,
            },
            updatedAt: {
              type: Date,
            },
            userName:{
                type:String
            },
            acceptedReason: {
                type: String,  // Reason provided by admin for accepting the return
                required: function () {
                  return this.status === 'Accepted';  // Only required if the status is 'Accepted'
                },
              },
              rejectedReason: {
                type: String,  // Reason provided by admin for rejecting the return
                required: function () {
                  return this.status === 'Rejected';  // Only required if the status is 'Rejected'
                },
              },
          },
          
  
    }],
    deliveryAddress: { 
        label: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        pinCode: { 
            type: String, 
            required: true, 
            // match: /^[0-9]{6}$/ 
        },
        phoneNumber: { 
            type: String, 
            required: true, 
            // match: /^[0-9]{10}$/ 
        }
    },
    orderStatus: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Shipped', 'delivered', 'Cancelled',], 
        default: 'Pending' 
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: { 
        type: String, 
        enum: ['cash-on-delivery', 'wallet', 'paypal'], 
        required: true 
    },
    offerDiscount: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    DiscountType:{
        type:Number,
        default:0,
    },
    couponDiscount: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    totalDiscount: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    deliveryCharge: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    finalAmount: { 
        type: Number, 
        required: true 
    },
    actualPrice:{
        type:Number,
        required:true,
    },
    shippingMethod: { 
        type: String, 
        enum: ['standard', 'express'], 
        required: true 
    },
    cancelled: { type: Boolean, default: false },
    // returned: { type: Boolean, default: false },
    // returnReason: { 
    //     type: String, 
    //     required: function () { return this.returned; } 
    // },
    invoiceDate: { type: Date, default: Date.now },
    couponCode: { type: String },
    couponApplied: { type: Boolean, required: true, default: false },
    orderDate: { type: Date, default: Date.now }
});

// Add indexes
ordersSchema.index({ userId: 1, orderDate: -1 });
ordersSchema.index({ orderStatus: 1 });

const Orders = mongoose.model('BuyNowOrder', ordersSchema);
export default Orders;

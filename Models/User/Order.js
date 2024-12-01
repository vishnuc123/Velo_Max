import mongoose from "mongoose";

const ordersSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Reference to the User making the purchase
    categoryId: { 
        type: String,  
        required: true 
    }, // The product being purchased
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    }, // The product being purchased

    quantity: { 
        type: Number, 
        required: true, 
        default: 1 
    }, // Quantity (default to 1 for "Buy Now")
    totalPrice: { 
        type: Number, 
        required: true 
    }, // Total amount = productPrice * quantity
    paymentMethod: { 
        type: String, 
        enum: ['cash-on-delivery', 'credit-card', 'paypal'], 
        required: true 
    }, // Payment method selected
    deliveryAddress: { 
        label: {
            type: String,
            required: true
        }, // Label for the address (e.g., "Home", "Office")
        address: {
            type: String,
            required: true
        }, // Full address
        city: {
            type: String,
            required: true
        }, // City
        pinCode: {
            type: String,
            required: true
        }, // Pin code
        phoneNumber: {
            type: String,
            required: true
        } // Phone number
    }, // Delivery address as an embedded object
    orderStatus: { 
        type: String, 
        enum: ['Pending', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    }, // Status of the order
    orderDate: { 
        type: Date, 
        default: Date.now 
    } // Order creation timestamp
});

const Orders = mongoose.model('BuyNowOrder', ordersSchema);
export default Orders


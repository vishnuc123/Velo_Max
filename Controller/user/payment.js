import Orders from "../../Models/User/Order.js";
import User from "../../Models/User/UserDetailsModel.js";
import mongoose from "mongoose";

export const processPayment = async (req, res) => {
    try {
        console.log('Request Body:', req.body);

        const userId = req.session.UserId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User not logged in.",
            });
        }

        const {
            categoryId,
            productId,
            shippingMethod,
            quantity = 1,
            totalPrice,
            address,
            paymentMethod
        } = req.body;

        // Validate inputs
        if (!categoryId || !productId || !quantity || !totalPrice || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields in the request body.",
            });
        }

        const { label, address: fullAddress, city, phoneNumber, pinCode } = address || {};
        if (!label || !fullAddress || !city || !phoneNumber || !pinCode) {
            return res.status(400).json({
                success: false,
                message: "Incomplete address details.",
            });
        }

        // Validate payment method
        const validPaymentMethods = ['cash-on-delivery', 'credit-card', 'paypal'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method.",
            });
        }

        // Validate product stock and update dynamically
        const dynamicCollection = mongoose.connection.collection(categoryId);
        const productObjectId = new mongoose.Types.ObjectId(productId);

        const product = await dynamicCollection.findOneAndUpdate(
            { _id: productObjectId, Stock: { $gte: quantity } },
            { $inc: { Stock: -quantity } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product with ID ${productId} not found or insufficient stock.`,
            });
        }

        // Calculate total discount and final amount (assuming no offer or coupon discounts provided in this case)
        const offerDiscount = 0; // Adjust if applicable
        const couponDiscount = 0; // Adjust if applicable
        const deliveryCharge = shippingMethod === 'Standard Shipping' ? 100 : 0; // Example logic for delivery charges
        const totalDiscount = offerDiscount + couponDiscount;
        const finalAmount = totalPrice - totalDiscount + deliveryCharge;

        // Create order document
        const newOrder = new Orders({
            userId,
            orderedItem: [{
                categoryId,
                productId,
                quantity,
                totalPrice,
            }],
            deliveryAddress: {
                label,
                address: fullAddress,
                city,
                pinCode,
                phoneNumber,
            },
            paymentMethod,
            offerDiscount,
            couponDiscount,
            totalDiscount,
            deliveryCharge,
            finalAmount,
            couponCode: null, // No coupon provided in this request
            couponApplied: false,
        });

        const savedOrder = await newOrder.save();

        return res.status(200).json({
            success: true,
            message: 'Order processed successfully.',
            order: savedOrder,
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the order.',
        });
    }
};




export const getOrderSuccess = async(req,res) => {
    try {
        const userId = req.session.UserId
        const userDetails = await User.findById(userId)
        console.log(userDetails);
        
        res.render('User/ordersuccess.ejs',{userDetails:userDetails})
    } catch (error) {
        console.log('error while getting orderSucces',error);
        
    }
}

export const cancelOrder = async (req, res) => {
    try {
        const { productId, orderId } = req.body;
        console.log(req.body);
        

        // Validate the input
        if (!productId || !orderId) {
            return res.status(400).json({ message: 'Missing required fields: productId or orderId' });
        }

        // Find and update the order
        const orderDetails = await Orders.findOneAndUpdate(
            { _id: orderId, productId: productId },
            { orderStatus: 'Cancelled' }, // Update order status to 'Cancelled'
            { new: true } // Return the updated document
        );

        if (!orderDetails) {
            return res.status(404).json({ message: 'Order not found or already cancelled' });
        }

        // Respond with success
        return res.status(200).json({ message: 'Order cancelled successfully', orderDetails });
    } catch (error) {
        console.error('Error while cancelling order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const processCartPayment = async (req, res) => {
    try {
        // Extract data from the request body
        const { email, addressDetails, shippingCharge, cartdata, paymentMethod } = req.body;
        // console.log(req.body);
        

        if (
            !email ||
            !addressDetails ||
            !cartdata ||
            !Array.isArray(cartdata.cartData) ||
            cartdata.cartData.length === 0
        ) {
            return res.status(400).json({ message: 'Invalid data provided.' });
        }

        // Extract the first element in cartData and its items
        const cart = cartdata.cartData[0];
        const { items, userId } = cart;
        const totalPrice = cart.totalPrice
        // console.log(totalPrice);
        
        

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart items are empty.' });
        }

        // Calculate the final amount
        const finalAmount = totalPrice + shippingCharge;

        // Create an order object
        const newOrder = new Orders({
            userId: userId, // Use the userId from cartData
            orderedItem: items.map(item => ({
                categoryId: item.categoryId,
                productId: item.productId,
                quantity: item.quantity,
                totalPrice: item.price,
            })),
            deliveryAddress: addressDetails,
            orderStatus: 'Pending', // Default status
            paymentStatus: 'Pending', // Payment status to be updated after successful payment
            paymentMethod: paymentMethod, // Assuming payment method is sent in the body
            offerDiscount: req.body.offerDiscount || 0, // Optional discount
            couponDiscount: req.body.couponDiscount || 0, // Optional coupon discount
            totalDiscount: req.body.totalDiscount || 0, // Optional total discount
            deliveryCharge: shippingCharge,
            finalAmount: finalAmount,
            couponCode: req.body.couponCode || '', // Optional coupon code
            couponApplied: req.body.couponApplied || false, // Whether a coupon was applied
            orderDate: new Date(),
        });

        // Save the order to the database
        await newOrder.save();

        // Respond with the created order
        res.status(200).json({ message: 'Order placed successfully!', order: newOrder });
    } catch (error) {
        console.log('Error while processing cart payment:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};

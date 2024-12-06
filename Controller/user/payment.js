import Orders from "../../Models/User/Order.js";
import User from "../../Models/User/UserDetailsModel.js";
import mongoose from "mongoose";

export const processPayment = async (req, res) => {
    try {
        // Log the incoming request body to inspect the data
        // console.log('Request Body:', req.body);

        // Assuming `req.session.UserId` holds the logged-in user's ID
        const userId = req.session?.UserId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User not logged in.",
            });
        }

        // Extract payment details from the request body
        const {
            productId,
            categoryId,
            quantity,
            totalPrice,
            paymentMethod,
            address, // Address from request body
        } = req.body;

        // Validate required fields
        if (!productId || !quantity || !totalPrice || !paymentMethod || !address) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields. Please check the input.",
            });
        }

        // Validate `address` object fields
        const { label, address: addr, city, pinCode, phoneNumber } = address;
        if (!label || !addr || !city || !pinCode || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Incomplete address details.",
            });
        }

        // // Log payment details
        // console.log('Processing payment...');
        // console.log('Payment Method:', paymentMethod);
        // console.log('Delivery Address:', address);

        // Save the order to the database
          // Step 1: Find the product and validate stock
          const dynamicCollection = mongoose.connection.collection(categoryId);

      // Convert productId to ObjectId using `new` keyword
      const productObjectId = new mongoose.Types.ObjectId(productId);

      if (product.isblocked) {
        return res.status(400).json({
            success: false,
            message: 'This product is blocked and cannot be updated.',
        });
    }

      const product = await dynamicCollection.findOneAndUpdate(
        { _id: productObjectId, Stock: { $gte: quantity } }, // Ensure product exists and has enough stock
        { $inc: { Stock: -quantity } },                     // Deduct the order quantity from stock
        { new: true }                                       // Return the updated product document
    );
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found or insufficient stock.",
        });
    }


        const newOrder = new Orders({
            userId,
            categoryId,
            productId,
            quantity,
            totalPrice,
            paymentMethod,
            deliveryAddress: {
                label,
                address: addr,
                city,
                pinCode,
                phoneNumber,
            },
        });

        const savedOrder = await newOrder.save();

        // Respond with success
        return res.status(200).json({
            success: true,
            message: 'Payment processed successfully.',
            order: savedOrder,
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the payment.',
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
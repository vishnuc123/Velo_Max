import mongoose from "mongoose";
import Orders from "../../Models/User/Order.js";

export const OrderListing = async (req,res) => {
    try {
        const orderDetails = await Orders.find()
        res.status(200).render("Admin/orders.ejs",{orderDetails})
    } catch (error) {
        console.log("error while getting order lists",error);
        
    }
}

export const OrderView = async (req, res) => {
    try {
        const orderId = req.params.OrderId;

        // Step 1: Fetch order details based on orderId
        const orderDetails = await Orders.find({ _id: orderId });

        if (orderDetails.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // console.log(orderDetails);

        // Step 2: Get the categoryId and productId from the orderDetails
        const categoryId = orderDetails[0].categoryId;
        const productId = orderDetails[0].productId;

        // console.log('Category ID:', categoryId);
        // console.log('Product ID:', productId);

        // Step 3: Fetch the specific product using the categoryId as the collection name
        const productDetails = await mongoose.connection
            .collection(categoryId)
            .findOne({ _id: productId });

        if (!productDetails) {
            return res.status(404).json({ message: 'Product not found in the specified category' });
        }

        // console.log('Product Details:', productDetails);

        // Step 4: Fetch all products related to the categoryId
        // const relatedProducts = await mongoose.connection.collection(categoryId).find().toArray();

     


        // Send the response with order details, specific product details, and related products
        return res.status(200).json({
            orderDetails,
            productDetails,
        });
    } catch (error) {
        console.error('Error while getting the orders data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const orderUpdate = async (req, res) => {
    try {
        const { orderId, status } = req.params;

      

        // Find the order by its ID and update the orderStatus
        const updatedOrder = await Orders.findOneAndUpdate(
            { _id: orderId },  // Filter criteria
            { $set: { orderStatus: status } }, // Update action
            { new: true } // Return the updated document
        );

        // If the order was not found, return an error response
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Successfully updated
        res.status(200).json({ message: "Order status updated successfully!", updatedOrder });
    } catch (error) {
        console.log('Error while updating the order status:', error);
        res.status(500).json({ message: "An error occurred while updating the order." });
    }
};

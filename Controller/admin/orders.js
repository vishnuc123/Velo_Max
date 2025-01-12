import mongoose from "mongoose";
import Orders from "../../Models/User/Order.js";

export const OrderListing = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;  // Get current page, default is 1
      const pageSize = 10;  // Set the number of items per page
      const skip = (page - 1) * pageSize;
  
      // Get sorting parameters (default to 'orderDate' or 'finalAmount')
      const sortBy = req.query.sortBy || 'orderDate';  // Default sorting by orderDate
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;  // Sorting order (asc or desc)
  
      // Fetch orders from the database
      const orderDetails = await Orders.find()
        .skip(skip)
        .limit(pageSize)
        .sort({ [sortBy]: sortOrder });  // Sorting by the selected field and order
  
      // Get the total number of orders to calculate total pages
      const totalOrders = await Orders.countDocuments();
      const totalPages = Math.ceil(totalOrders / pageSize);
  
      res.status(200).render("Admin/orders.ejs", {
        orderDetails,
        currentPage: page,
        totalPages: totalPages,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
    } catch (error) {
      console.log("Error while getting order lists:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  


export const OrderView = async (req, res) => {
    try {
        const orderIdString = req.params.OrderId;
        console.log(orderIdString);

        // Validate orderId format
        if (!mongoose.Types.ObjectId.isValid(orderIdString)) {
            return res.status(400).json({ message: 'Invalid order ID format' });
        }

        const orderId = new mongoose.Types.ObjectId(orderIdString);

        // Step 1: Fetch order details based on orderId
        const orderDetails = await Orders.find({ _id: orderId });

        if (orderDetails.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Extract orderedItem (to handle the product and category details)
        const orderedItems = orderDetails[0].orderedItem;

        if (!orderedItems || orderedItems.length === 0) {
            return res.status(400).json({ message: 'No items in the order' });
        }

        // Step 2: Fetch the details of the specific products in the orderedItems
        const productDetailsPromises = orderedItems.map(async (item) => {
            const { categoryId, productId } = item;

            if (!categoryId || !productId) {
                return null; // Skip if no categoryId or productId
            }

            // Fetch the product from the category collection
            const product = await mongoose.connection
                .collection(categoryId)  // Use categoryId to determine the collection
                .findOne({ _id: new mongoose.Types.ObjectId(productId) });

            return product;  // Return the product details
        });

        // Wait for all the product details to be fetched
        const productDetails = await Promise.all(productDetailsPromises);

        // Filter out any null values (if any product is not found)
        const validProductDetails = productDetails.filter(product => product !== null);

        if (validProductDetails.length === 0) {
            return res.status(404).json({ message: 'No valid products found in the order' });
        }

        // Step 3: Send the response with order details and the valid product details
        return res.status(200).json({
            orderDetails,
            orderedItems,
            productDetails: validProductDetails,  // Send only the valid products
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

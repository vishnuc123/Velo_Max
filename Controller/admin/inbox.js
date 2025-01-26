
import mongoose from "mongoose";
import errorHandler from "../../Error-Reporter.js"
import Orders from "../../Models/User/Order.js";


export const getInbox = async(req,res,Next) => {
    try {
        res.render('Admin/inbox.ejs')
    } catch (error) {
        next(error)
    }
}

export const getReturnDetails = async (req,res,next) => {
    try {
        
    } catch (error) {
        next(error)
    }
}

export const getReturnRequests = async (req, res, next) => {
  try {
    // Unwind the orderedItem array to process each item individually
    const ordersWithPendingReturnRequests = await Orders.aggregate([
      {
        $unwind: "$orderedItem", // Unwind the orderedItem array
      },
      {
        $match: {
          "orderedItem.returnRequest.status": "Pending", // Match returnRequest with status 'Pending'
        },
      },
      {
        $lookup: {
          from: "products", // Assuming 'products' is the collection name for products
          localField: "orderedItem.productId",
          foreignField: "_id",
          as: "orderedItem.productDetails",
        },
      },
      {
        $group: {
          _id: "$_id", // Group back the orders after filtering
          orderDetails: { $first: "$$ROOT" },
        },
      },
    ]);

    // Check if no orders were found
    if (!ordersWithPendingReturnRequests || ordersWithPendingReturnRequests.length === 0) {
      return res.status(404).json({ message: "No pending return requests found." });
    }

    // Respond with the list of orders containing pending return requests
    res.status(200).json({
      message: "Pending return requests fetched successfully.",
      orders: ordersWithPendingReturnRequests,
    });
  } catch (error) {
    console.error("Error while fetching pending return requests:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};


export const acceptReturnRequest = async (req, res, next) => {
  try {
    const { categoryId, quantity, coupon, orderId, productId } = req.body; // Extract categoryId, quantity, coupon, orderId, and productId from the request body

    console.log(req.body);

    // Convert productId to a MongoDB ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);
    console.log(productObjectId);
    

    // Fetch the product from the dynamically named collection (categoryId as collection name)
    const product = await mongoose.connection.collection(categoryId).findOne({ _id: productObjectId });

    // console.log(product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const order = await Orders.findOne({ _id: orderId });

    
    const orderedItemPrice = order.orderedItem.find(item => item.actualPrice)
    // Update the stock (assuming product.stock exists)
    product.Stock += parseInt(quantity);
    await mongoose.connection.collection(categoryId).updateOne({ _id: productObjectId }, { $set: { stock: product.Stock } });

    // Calculate the total price
    let totalPrice = orderedItemPrice * quantity;

    // Apply coupon discount if available and valid
    if (coupon && coupon.discount > 0) {
      const discountPerItem = coupon.discount / quantity;
      totalPrice -= discountPerItem * quantity;
    }

    // Find the order based on orderId

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the item in the order and change the return request status to 'accepted'
    const orderedItem = order.orderedItem.find(item => item.productId.toString() === productObjectId.toString());

    if (orderedItem && orderedItem.returnRequest) {
      orderedItem.returnRequest.status = 'Accepted';
      orderedItem.status = 'Return-accepted;'
      await order.save(); // Save the updated order
    } else {
      return res.status(404).json({ message: "Return request not found for the item" });
    }

    // Return the updated stock and calculated total price
    res.status(200).json({
      message: "Return request accepted successfully",
      updatedStock: product.Stock,
      totalPrice,
    });

  } catch (error) {
    next(error); // Pass the error to the next middleware or error handler
  }
};


export const rejectReturnRequest = async (req,res,next) => {
  try {
    console.log(req.body);

  } catch (error) {
    next(error)
  }
}

import mongoose from "mongoose";
import errorHandler from "../../Error-Reporter.js"
import Orders from "../../Models/User/Order.js";
import { notifyClients } from "../../Utils/Admin/sse.js";


export const getInbox = async(req,res,Next) => {
    try {
        res.render('Admin/inbox.ejs')
    } catch (error) {
        next(error)
    }
}

// export const getReturnDetails = async (req,res,next) => {
//     try {
        
//     } catch (error) {
//         next(error)
//     }
// }

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
    const { categoryId, quantity, coupon, orderId, productId } = req.body;

    console.log("Request Body:", req.body);

    if (!categoryId || !quantity || !orderId || !productId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Convert productId to a MongoDB ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);
    console.log("Converted Product ObjectId:", productObjectId);

    // Update the status of the ordered item
    const updateResult = await Orders.updateOne(
      {
        _id: orderId,
        "orderedItem.productId": productId, // Match the productId in the ordered items
      },
      {
        $set: {
          "orderedItem.$.status": "Return-accepted", // Update the specific item's status
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Order or item not found" });
    }

    console.log("Order item status updated:", updateResult);

    // Fetch the product from the dynamically named collection (categoryId as collection name)
    const product = await mongoose.connection.collection(categoryId).findOne({ _id: productObjectId });

    if (!product) {
      return res.status(404).json({ message: "Product not found in the specified category" });
    }

    console.log("Product Found:", product);

    // Update the product stock
    const updatedStock = product.Stock + parseInt(quantity);
    const stockUpdateResult = await mongoose.connection.collection(categoryId).updateOne(
      { _id: productObjectId },
      { $set: { Stock: updatedStock } }
    );

    console.log("Product Stock Updated:", stockUpdateResult);

    // Fetch the order for further processing
    const order = await Orders.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order Found:", order);

    // Find the item in the order
    const orderedItem = order.orderedItem.find((item) => item.productId.toString() === productObjectId.toString());

    if (!orderedItem) {
      return res.status(404).json({ message: "Ordered item not found" });
    }

    // Update the return request status and item status
    if (orderedItem.returnRequest) {
      orderedItem.returnRequest.status = "Accepted";
      orderedItem.status = "Return-accepted";
    } else {
      return res.status(404).json({ message: "Return request not found for the item" });
    }

    // Save the updated order
    await order.save();

    console.log("Order Updated Successfully:", order);

    // Calculate the total price
    const orderedItemPrice = orderedItem.actualPrice;
    let totalPrice = orderedItemPrice * quantity;

    // Apply coupon discount if available and valid
    if (coupon && coupon.discount > 0) {
      const discountPerItem = coupon.discount / quantity;
      totalPrice -= discountPerItem * quantity;
    }

    // Return the updated stock and calculated total price
    res.status(200).json({
      message: "Return request accepted successfully",
      updatedStock,
      totalPrice,
    });
  } catch (error) {
    console.error("Error in acceptReturnRequest:", error.message);
    next(error); // Pass the error to the next middleware or error handler
  }
};

export const rejectReturnRequest = async (req, res, next) => {
  try {
    const { orderId, productId } = req.body;

    console.log("Request Body:", req.body);

    if (!orderId || !productId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch the order
    const order = await Orders.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order Found:", order);

    // Find the item in the order
    const orderedItem = order.orderedItem.find((item) => item.productId.toString() === productId);

    if (!orderedItem) {
      return res.status(404).json({ message: "Ordered item not found" });
    }

    // Reject the return request
    if (orderedItem.returnRequest) {
      orderedItem.returnRequest.status = "Rejected";
      orderedItem.status = "Return-Rejected";
    } else {
      return res.status(404).json({ message: "Return request not found for the item" });
    }

    // Save the updated order
    await order.save();

    console.log("Order Updated Successfully:", order);

    res.status(200).json({
      message: "Return request rejected successfully",
    });
  } catch (error) {
    console.error("Error in rejectReturnRequest:", error.message);
    next(error); // Pass the error to the next middleware or error handler
  }
};

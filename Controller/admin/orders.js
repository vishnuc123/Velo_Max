import mongoose from "mongoose";
import Orders from "../../Models/User/Order.js";
import { getPaginatedRecords, findRecordById, updateRecordById } from "../../Utils/Admin/orders.js";

export const OrderListing = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const sortBy = req.query.sortBy || 'orderDate';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

    const { records: orderDetails, totalPages } = await getPaginatedRecords(Orders, { page, sortBy, sortOrder });

    res.status(200).render("Admin/orders.ejs", {
      orderDetails,
      currentPage: page,
      totalPages,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    console.log("Error while getting order lists:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const OrderView = async (req, res) => {
  try {
    const orderId = req.params.OrderId;

    const orderDetails = await findRecordById(Orders, orderId);

    if (!orderDetails) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderedItems = orderDetails.orderedItem || [];

    const productDetailsPromises = orderedItems.map(async (item) => {
      const { categoryId, productId } = item;

      if (!categoryId || !productId) {
        return null;
      }

      return await mongoose.connection
        .collection(categoryId)
        .findOne({ _id: new mongoose.Types.ObjectId(productId) });
    });

    const productDetails = await Promise.all(productDetailsPromises);
    const validProductDetails = productDetails.filter(product => product !== null);

    if (validProductDetails.length === 0) {
      return res.status(404).json({ message: 'No valid products found in the order' });
    }

    return res.status(200).json({
      orderDetails,
      orderedItems,
      productDetails: validProductDetails,
    });
  } catch (error) {
    console.error('Error while getting the orders data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const orderUpdate = async (req, res) => {
  try {
    const { orderId, status } = req.params;

    const updatedOrder = await updateRecordById(Orders, orderId, { orderStatus: status });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order status updated successfully!", updatedOrder });
  } catch (error) {
    console.log('Error while updating the order status:', error);
    res.status(500).json({ message: "An error occurred while updating the order." });
  }
};

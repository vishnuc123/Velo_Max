import Orders from "../../Models/User/Order.js";
import User from "../../Models/User/UserDetailsModel.js";
import mongoose from "mongoose";
import paypal from "@paypal/checkout-server-sdk";
import axios from "axios";
import dotenv from "dotenv";
import CartModel from "../../Models/User/cart.js";
dotenv.config();

export const processPayment = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

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
      paymentMethod,
    } = req.body;

    // Validate inputs
    if (
      !categoryId ||
      !productId ||
      !quantity ||
      !totalPrice ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in the request body.",
      });
    }

    const {
      label,
      address: fullAddress,
      city,
      phoneNumber,
      pinCode,
    } = address || {};
    if (!label || !fullAddress || !city || !phoneNumber || !pinCode) {
      return res.status(400).json({
        success: false,
        message: "Incomplete address details.",
      });
    }

    // Validate payment method
    const validPaymentMethods = ["cash-on-delivery", "credit-card", "paypal"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    // Validate product stock and check if product is blocked
    const dynamicCollection = mongoose.connection.collection(categoryId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const product = await dynamicCollection.findOne({ _id: productObjectId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found.`,
      });
    }

    // Check if the product is blocked
    if (product.isblocked) {
      return res.status(400).json({
        success: false,
        message: `Product with ID ${productId} is currently blocked.`,
      });
    }

    // Check for sufficient stock
    if (product.Stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product with ID ${productId}.`,
      });
    }

    // Update product stock (deduct the quantity)
    await dynamicCollection.findOneAndUpdate(
      { _id: productObjectId },
      { $inc: { Stock: -quantity } },
      { new: true }
    );

    // Calculate total discount and final amount (assuming no offer or coupon discounts provided in this case)
    const offerDiscount = 0; // Adjust if applicable
    const couponDiscount = 0; // Adjust if applicable
    const deliveryCharge = shippingMethod === "Express Shipping" ? 80 : 0; // Example logic for delivery charges
    const totalDiscount = offerDiscount + couponDiscount;
    const finalAmount = totalPrice - totalDiscount + deliveryCharge;
    const shippingEnum =
      shippingMethod === "Express Shipping" ? "express" : "standard";

    // Create order document
    const newOrder = new Orders({
      userId,
      orderedItem: [
        {
          categoryId,
          productId,
          quantity,
          totalPrice,
        },
      ],
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
      shippingMethod: shippingEnum,
      couponCode: null, // No coupon provided in this request
      couponApplied: false,
    });

    const savedOrder = await newOrder.save();

    return res.status(200).json({
      success: true,
      message: "Order processed successfully.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the order.",
    });
  }
};

export const getOrderSuccess = async (req, res) => {
  try {
    const userId = req.session.UserId;
    const userDetails = await User.findById(userId);
    const orderedIdString = req.params.orderId;
    console.log(orderedIdString);

    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(orderedIdString)) {
      console.log("Invalid Order ID:", orderedIdString);
      return res.status(400).send("Invalid Order ID.");
    }

    const orderId = new mongoose.Types.ObjectId(orderedIdString);
    console.log("Order ID:", orderId);

    // Fetch order details
    const orderDetails = await Orders.findById(orderId);
    if (!orderDetails) {
      console.log("Order not found for ID:", orderId);
      return res.status(404).send("Order not found.");
    }

    console.log("Order Details:", orderDetails);

    // Render the order success page and pass the required data
    res.render("User/orderSuccess.ejs", {
      userDetails,
      orderDetails: orderDetails,
    });
  } catch (error) {
    console.log("Error while getting orderSuccess:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { productIds, orderId } = req.body;

    // Validate input
    if (!Array.isArray(productIds) || productIds.length === 0 || !orderId) {
      return res
        .status(400)
        .json({ message: "Missing required fields: productIds or orderId" });
    }

    // Find the order first to check if it's valid and not already cancelled or delivered
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.orderStatus.toLowerCase() === "cancelled" ||
      order.orderStatus.toLowerCase() === "delivered"
    ) {
      return res.status(400).json({
        message: "Order is already cancelled or delivered, cannot cancel again",
      });
    }

    // Update the status of the products in the order to "Cancelled"
    const updateResult = await Orders.updateMany(
      {
        _id: orderId,
        "orderedItem.productId": { $in: productIds }, // Match any of the product IDs
      },
      {
        $set: {
          "orderedItem.$[item].status": "Cancelled",
          orderStatus: "Cancelled",
        },
      },
      {
        arrayFilters: [{ "item.productId": { $in: productIds } }], // Ensure we only update the products in the array
        new: true, // Return the updated document
      }
    );

    if (updateResult.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "No matching products found or already cancelled" });
    }

    // Respond with the success message
    return res.status(200).json({
      message: "Order(s) cancelled successfully",
      updatedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error while cancelling order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const processCartPayment = async (req, res) => {
  try {
    // Extract data from the request body
    const { email, addressDetails, shippingCharge, cartdata, paymentMethod } =
      req.body;
    console.log(req.body);

    if (
      !email ||
      !addressDetails ||
      !cartdata ||
      !Array.isArray(cartdata.cartData) ||
      cartdata.cartData.length === 0
    ) {
      return res.status(400).json({ message: "Invalid data provided." });
    }

    // Extract the first element in cartData and its items
    const cart = cartdata.cartData[0];
    const { items, userId } = cart;
    const totalPrice = cart.totalPrice;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart items are empty." });
    }

    // Calculate the final amount
    const couponDiscount = req.body.couponDiscount || 0;
    const finalAmount = totalPrice + shippingCharge - couponDiscount;
    const couponApplied = req.body.couponCode ? true : false;

    const shippingMethod = shippingCharge === 80 ? "express" : "standard";

    // Loop through each item to validate stock, check if product is blocked, and update stock
    for (const item of items) {
      console.log(`Product ID: ${item.productId}`);
      console.log(`Category ID: ${item.categoryId}`);

      const productObjectId = new mongoose.Types.ObjectId(item.productId);
      const dynamicCollection = mongoose.connection.collection(item.categoryId);

      // Fetch product and check if it is blocked
      const product = await dynamicCollection.findOne({ _id: productObjectId });

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${item.productId} not found.`,
        });
      }

      if (product.isblocked) {
        return res.status(400).json({
          message: `Product with ID ${item.productId} is currently blocked.`,
        });
      }

      // Check if there is sufficient stock for the product
      if (product.Stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product with ID ${item.productId}.`,
        });
      }

      // Update product stock (deduct the quantity)
      await dynamicCollection.findOneAndUpdate(
        { _id: productObjectId },
        { $inc: { Stock: -item.quantity } },
        { new: true } // Use 'returnDocument' for newer versions of MongoDB
      );
    }

    // Create an order object
    const newOrder = new Orders({
      userId: userId,
      orderedItem: items.map((item) => ({
        categoryId: item.categoryId,
        productId: item.productId,
        quantity: item.quantity,
        totalPrice: item.price,
      })),
      deliveryAddress: addressDetails,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: paymentMethod,
      offerDiscount: req.body.offerDiscount || 0,
      couponDiscount: couponDiscount || 0,
      totalDiscount: req.body.totalDiscount || 0,
      deliveryCharge: shippingCharge,
      finalAmount: finalAmount,
      shippingMethod: shippingMethod,
      couponCode: req.body.couponCode || "",
      couponApplied: couponApplied || false,
      orderDate: new Date(),
    });

    // Save the order to the database
    await newOrder.save();
    const UserID = req.session.UserId;

    // Clear the cart after successful order
    await CartModel.updateOne(
      { userId: UserID },
      { $set: { items: [], totalPrice: 0 } }
    );

    // Respond with the created order
    res
      .status(200)
      .json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.log("Error while processing cart payment:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENTID,
  process.env.PAYPAL_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

export const paypalpayment = async (req, res) => {
  try {
    console.log(req.body);

    const userId = req.session.UserId;
    const {
      totalPrice,
      address,
      shippingMethod,
      categoryId,
      productId,
      quantity,
    } = req.body;

    if (!totalPrice || !address || !categoryId || !productId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    if (product.isblocked) {
      return res.status(400).json({
        success: false,
        message: `Product with ID ${productId} is currently blocked.`,
      });
    }

    let normalizedShippingMethod = "";
    if (shippingMethod === "Express Shipping") {
      normalizedShippingMethod = "express";
    } else if (shippingMethod === "Standard Shipping") {
      normalizedShippingMethod = "standard";
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid shipping method." });
    }

    // Fetch the latest exchange rate for INR to USD
    let exchangeRate;
    try {
      const exchangeRateResponse = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      exchangeRate = exchangeRateResponse?.data?.rates?.USD || 0.012; // Fallback rate
    } catch (error) {
      console.error("Error fetching exchange rate:", error.message);
      exchangeRate = 0.012; // Fallback rate
    }

    // Convert INR to USD
    const usdValue = (totalPrice * exchangeRate).toFixed(2);
    let shippingCharge = 0;
    if (normalizedShippingMethod === "express") {
      shippingCharge = 80; // Rs. 80 for express shipping
    } else if (normalizedShippingMethod === "standard") {
      shippingCharge = 0; // Free for standard shipping
    }
    const couponDiscount = req.body.couponDiscount || 0;
    const finalAmount = totalPrice + shippingCharge - couponDiscount;

    console.log(`Total Price in INR: ${totalPrice}`);
    console.log(`Exchange Rate (INR to USD): ${exchangeRate}`);
    console.log(`Converted Total Price in USD: ${usdValue}`);

    // Save the order details to the database with a "Pending" status
    const newOrder = new Orders({
      userId: userId, // Use the userId from cartData
      orderedItem: [
        {
          categoryId: categoryId,
          productId: productId,
          quantity: quantity,
          totalPrice: totalPrice,
        },
      ],
      deliveryAddress: address,
      orderStatus: "Pending", // Default status
      paymentStatus: "Success", // Payment status to be updated after successful payment
      paymentMethod: "paypal", // Assuming payment method is sent in the body
      offerDiscount: req.body.offerDiscount || 0, // Optional discount
      couponDiscount: req.body.couponDiscount || 0, // Optional coupon discount
      totalDiscount: req.body.totalDiscount || 0, // Optional total discount
      deliveryCharge: shippingCharge,
      shippingMethod: normalizedShippingMethod,
      finalAmount: finalAmount,
      couponCode: req.body.couponCode || "", // Optional coupon code
      couponApplied: req.body.couponApplied || false, // Whether a coupon was applied
      orderDate: new Date(),
    });

    console.log(newOrder);

    await newOrder.save();

    console.log(`Order saved to database: ${newOrder._id}`);

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // USD is required for PayPal transactions
            value: usdValue,
          },
          shipping: {
            name: {
              full_name: address.label,
            },
            address: {
              address_line_1: address.address,
              admin_area_2: address.city,
              postal_code: address.pinCode,
              country_code: "IN",
            },
          },
          description: `Order for category: ${categoryId}, product: ${productId}, quantity: ${quantity}`,
        },
      ],
      application_context: {
        brand_name: "Velo Max",
        locale: "en-US",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `http://localhost:4000/paypalsuccess?orderId=${newOrder._id}`,
        cancel_url: "http://localhost:4000/paypalcancel",
      },
    });

    const paypalOrder = await client.execute(request);

    const approvalUrl = paypalOrder.result.links.find(
      (link) => link.rel === "approve"
    )?.href;
    if (!approvalUrl) throw new Error("Approval URL not found.");

    res.status(200).json({ success: true, approvalUrl, newOrder });
  } catch (error) {
    console.error("Error creating PayPal order:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating PayPal payment.",
      error: error.message,
    });
  }
};



export const paypalCancel = (req, res) => {
  try {
    res.status(200).send("Payment was cancelled. Please try again.");
  } catch (error) {
    console.error("Error in PayPal cancellation handler:", error);
    res.status(500).send("Internal server error during cancellation.");
  }
};

export const paypalsuccess = async (req, res) => {
  try {
    const { token, PayerID, orderId } = req.query; // PayPal sends `token` and `PayerID` in the callback URL
    if (!token) {
      return res.status(400).send("Payment token missing.");
    }

    // Capture the payment
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({}); // PayPal requires an empty body for capture
    const capture = await client.execute(request);

    console.log("Capture Response:", capture);

    // Extract custom data (your app's orderId) and PayPal transaction details
    const purchaseUnit = capture.result.purchase_units[0];
    const paypalOrderId = capture.result.id;
    const appOrderId = purchaseUnit.custom_id; // Your application's orderId

    // Retrieve your app's order details using appOrderId
    const orderDetails = await Orders.findOne({ _id: orderId });
    if (!orderDetails) {
      return res.status(404).send("Order not found.");
    }
    console.log(orderDetails);

    // Retrieve user details
    const userDetails = await User.findOne({ _id: req.session.UserId });

    // Render the success page
    res
      .status(200)
      .render("User/orderSuccess.ejs", { orderDetails, userDetails });
  } catch (error) {
    console.error("Error capturing PayPal payment:", error.message);
    res
      .status(500)
      .send("Internal server error during payment success handling.");
  }
};

export const cartPaypalpayment = async (req, res) => {
  try {
    const userId = req.session.UserId;

    // Extract data from the request body
    const {
      cartdata,
      addressDetails,
      shippingCharge = 0,
      couponDiscount = 0,
      shippingMethod,
    } = req.body;
    console.log(req.body);

    if (!cartdata?.cartData || !addressDetails || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // Extract items from cartData
    const cartItems = cartdata.cartData[0]?.items || [];
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty or invalid." });
    }

    // Validate that none of the products in the cart are blocked
    for (const item of cartItems) {
      const productObjectId = new mongoose.Types.ObjectId(item.productId);
      const dynamicCollection = mongoose.connection.collection(item.categoryId);

      const product = await dynamicCollection.findOne({ _id: productObjectId });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found.`,
        });
      }

      if (product.isblocked) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} is currently blocked.`,
        });
      }
    }

    // Validate and calculate total price
    const totalPrice = cartItems.reduce((total, item) => {
      if (
        !item.categoryId ||
        !item.productId ||
        !item.quantity ||
        !item.price
      ) {
        throw new Error("Invalid cart item: Missing required fields.");
      }

      // Ensure all values are numbers
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(price) || isNaN(quantity)) {
        throw new Error(
          "Invalid cart item: Price or quantity is not a number."
        );
      }

      return total + price * quantity;
    }, 0);

    // Fetch the latest INR to USD exchange rate
    let exchangeRate;
    try {
      const exchangeRateResponse = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      exchangeRate = exchangeRateResponse?.data?.rates?.USD || 0.012; // Fallback rate
    } catch (error) {
      console.error("Error fetching exchange rate:", error.message);
      exchangeRate = 0.012; // Fallback rate
    }

    // Convert INR to USD
    const usdValue = (
      (totalPrice + shippingCharge - couponDiscount) *
      exchangeRate
    ).toFixed(2);

    // Save the order details to the database
    const newOrder = new Orders({
      userId,
      orderedItem: cartItems.map((item) => ({
        categoryId: item.categoryId,
        productId: item.productId,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
      })),
      deliveryAddress: {
        label: addressDetails.label,
        address: addressDetails.address,
        city: addressDetails.city,
        pinCode: addressDetails.pinCode,
        phoneNumber: addressDetails.phoneNumber,
      },
      orderStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "paypal",
      shippingMethod: shippingMethod,
      couponDiscount,
      deliveryCharge: shippingCharge,
      finalAmount: totalPrice + shippingCharge - couponDiscount,
      orderDate: new Date(),
    });

    await newOrder.save();

    console.log(`Order saved to database: ${newOrder._id}`);

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: usdValue,
          },
          shipping: {
            name: {
              full_name: addressDetails.label,
            },
            address: {
              address_line_1: addressDetails.address,
              admin_area_2: addressDetails.city,
              postal_code: addressDetails.pinCode,
              country_code: "IN",
            },
          },
          description: `Order containing ${cartItems.length} items`,
        },
      ],
      application_context: {
        brand_name: "Velo Max",
        locale: "en-US",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `http://localhost:4000/paypalsuccess?orderId=${newOrder._id}`,
        cancel_url: `http://localhost:4000/paypalcancel`,
      },
    });

    const paypalOrder = await client.execute(request);

    const approvalUrl = paypalOrder.result.links.find(
      (link) => link.rel === "approve"
    )?.href;
    if (!approvalUrl) throw new Error("Approval URL not found.");

    res.status(200).json({ success: true, approvalUrl, newOrder });
  } catch (error) {
    console.error("Error creating PayPal order:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating PayPal payment.",
      error: error.message,
    });
  }
};
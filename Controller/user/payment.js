import Orders from "../../Models/User/Order.js";
import User from "../../Models/User/UserDetailsModel.js";
import mongoose from "mongoose";
import paypal from "@paypal/checkout-server-sdk";
import axios from "axios";
import dotenv from "dotenv";
import CartModel from "../../Models/User/cart.js";
import Wallet from '../../Models/User/wallet.js';
import { fetchDocumentsFromCollection, checkExistingCollections } from '../../Utils/User/product.js'; 
dotenv.config();
import Coupons from "../../Models/Admin/coupon.js"
import category from "../../Models/Admin/category.js";


export const processPayment = async (req, res) => {
  try {

    // Check if the user is logged in
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
      discount,
      discountType,
      couponCode,
      couponDiscount,
    } = req.body;

    // Validate inputs
    if (!categoryId || !productId || !quantity || !totalPrice || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in the request body.",
      });
    }

    // Validate address details
    const { label, address: fullAddress, city, phoneNumber, pinCode } = address || {};
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
    const checkCategory = await category.findOne({categoryTitle:categoryId,isblocked:false})
    if(!checkCategory){
      return res.status(404).json({message:"category is blocked now please try again later"})
    }

    // Validate product stock and check if the product is blocked
    const dynamicCollection = mongoose.connection.collection(categoryId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const product = await dynamicCollection.findOne({ _id: productObjectId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found.`,
      });
    }

    if (product.isblocked) {
      return res.status(400).json({
        success: false,
        message: `Product with ID ${productId} is currently blocked.`,
      });
    }

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

    // Calculate actual price (product price * quantity)
    const actualPrice = product.ListingPrice * quantity;
    const parsedCoupon = parseFloat(couponDiscount)
// Check if a coupon code is provided
if (couponCode) {
  const couponDetails = await Coupons.find({ code: couponCode, isActive: true });

  if (couponDetails.length === 0) {
    return res.status(400).json({ message: "Invalid coupon code" });
  } else {
    const coupon = couponDetails[0];

    // Check if the coupon can still be used (usage limit not reached)
    if (coupon.usedCount < coupon.usageLimit) {
      // Proceed to update the usedCount
      await Coupons.updateOne(
        { code:couponCode, isActive: true },
        { $inc: { usedCount: 1 } }  // Increment usedCount by 1
      );

    } else {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }
  }
} else {
}

    

    // Handle discounts
    const parsedDiscount = parseFloat(discount) || 0;
    const totalDiscount = parsedDiscount + (parsedCoupon || 0);


    const deliveryCharge = shippingMethod === "Express Shipping" ? 80 : 0;

    const calculatedFinalAmount = actualPrice - totalDiscount + deliveryCharge;
    

    if (Math.abs(totalPrice - calculatedFinalAmount) > 1) {
      return res.status(400).json({
        success: false,
        message: "Mismatch in calculated total price. Please verify the order details.",
      });
    }

    if(calculatedFinalAmount>5000||totalPrice>6000){
      return res.status(500).json({
        success:false,
        message:"Maximum order amount Through Cash on delivery is Rs.5000"
      })
    }
    // Determine shipping method enum
    const shippingEnum = shippingMethod === "Express Shipping" ? "express" : "standard";

    // Create order document with the desired structure
    const newOrder = new Orders({
      userId,
      orderedItem: [
        {
          categoryId,
          productId,
          quantity,
          totalPrice: calculatedFinalAmount,
          actualPrice,
          DiscountAmount: parsedDiscount,
        },
      ],
      deliveryAddress: {
        label,
        address: fullAddress,
        city,
        pinCode,
        phoneNumber,
      },
      orderStatus: "Pending", // Default order status
      paymentStatus: "Pending", // Default payment status
      paymentMethod,
      offerDiscount: parsedDiscount,
      discountType,
      couponDiscount,
      totalDiscount,
      deliveryCharge,
      finalAmount: calculatedFinalAmount,
      actualPrice,
      shippingMethod: shippingEnum,
      couponCode,
      couponApplied: !!couponCode,
      cancelled: false, // Default value for cancelled status
      returned: false,  // Default value for returned status
      orderDate: new Date(),  // Set current date for order date
      invoiceDate: new Date(), // Set current date for invoice date
    });

    // Save order
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

    if (!mongoose.Types.ObjectId.isValid(orderedIdString)) {
      return res.status(400).send("Invalid Order ID.");
    }

    const orderId = new mongoose.Types.ObjectId(orderedIdString);

    // Fetch order details
    const orderDetails = await Orders.findById(orderId);
    if (!orderDetails) {
      return res.status(404).send("Order not found.");
    }


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

    const { orderId, productId, categoryId, quantity, totalPrice, paymentMethod } = req.body;

    if (!orderId || !productId || !quantity || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields: orderId, productId, quantity, or paymentMethod" });
    }

    // Find the order
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["cancelled", "delivered"].includes(order.orderStatus.toLowerCase())) {
      return res.status(400).json({ message: "Order is already cancelled or delivered, cannot cancel again" });
    }

    // Find the specific ordered item
    const orderedItem = order.orderedItem.find(item => item.productId.toString() === productId);
    if (!orderedItem) {
      return res.status(404).json({ message: "Product not found in the order" });
    }

    if (orderedItem.status === "Cancelled") {
      return res.status(400).json({ message: "Product is already cancelled" });
    }

    const updateResult = await Orders.updateOne(
      { _id: orderId, "orderedItem.productId": productId },
      { $set: { "orderedItem.$.status": "Cancelled" } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "No matching product found or already cancelled" });
    }

    const updatedOrder = await Orders.findById(orderId);

    const allItemsCancelled = updatedOrder.orderedItem.every(item => item.status === "Cancelled");

    let couponDiscountDeducted = 0;
    if (allItemsCancelled) {
      couponDiscountDeducted = order.couponDiscount || 0;

      await Orders.updateOne({ _id: orderId }, { $set: { orderStatus: "Cancelled" } });
    }

    if (["wallet", "paypal"].includes(paymentMethod)) {
      setTimeout(async () => {
        try {
          const userWallet = await Wallet.findOne({ userId: order.userId });

          if (!userWallet) {
            console.error("User wallet not found");
            return;
          }

          // Refund amount = total price of cancelled product
          let refundAmount = orderedItem.totalPrice;

          // If the whole order is cancelled, deduct coupon discount
          if (allItemsCancelled) {
            refundAmount -= couponDiscountDeducted;
            refundAmount = Math.max(refundAmount, 0); // Ensure refund doesn't go negative
          }

          userWallet.balance += refundAmount;

          // Add refund transaction to the wallet history
          userWallet.walletHistory.push({
            transactionType: "credit",
            amount: refundAmount,
            date: new Date(),
            description: `Refund for cancelled product ${productId} in order ID: ${orderId}${allItemsCancelled ? " (Coupon discount applied)" : ""}`,
          });

          // Save updated wallet
          await userWallet.save();
        } catch (error) {
          console.error("Error while updating wallet balance:", error);
        }
      }, 1000);
    }

    try {
      const collections = await checkExistingCollections();

      if (!collections.includes(categoryId)) {
        console.error(`Collection ${categoryId} does not exist.`);
        return;
      }

      // Fetch the product from the category collection
      const products = await fetchDocumentsFromCollection(categoryId, { _id: new mongoose.Types.ObjectId(productId) });

      if (products.length === 0) {
        console.error(`Product not found with ID: ${productId}`);
        return;
      }

      const product = products[0];

      product.stock += orderedItem.quantity;

      await mongoose.connection.db.collection(categoryId).updateOne(
        { _id: new mongoose.Types.ObjectId(productId) },
        { $set: { stock: product.stock } }
      );

      await mongoose.connection.db.collection("orders").updateOne(
        { _id: new mongoose.Types.ObjectId(orderId), "orderedItem.productId": new mongoose.Types.ObjectId(productId) },
        { $set: { "orderedItem.$.status": "Cancelled" } }
      );

    } catch (error) {
      console.error("Error updating stock:", error);
    }

    return res.status(200).json({
      message: "Product cancelled successfully",
      refundedAmount: ["wallet", "paypal"].includes(paymentMethod)
        ? orderedItem.totalPrice - (allItemsCancelled ? couponDiscountDeducted : 0)
        : 0,
      couponDiscountDeducted: allItemsCancelled ? couponDiscountDeducted : 0,
    });
  } catch (error) {
    console.error("Error while cancelling order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};







export const processCartPayment = async (req, res) => {
  try {
    const { email, addressDetails, shippingCharge, cartItems, paymentMethod, couponCode, totalDiscountedPrice, totalPrice, } = req.body;

    if (
      !email ||
      !addressDetails ||
      !cartItems ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return res.status(400).json({ message: "Invalid data provided." });
    }

    const invalidItem = cartItems.find(item => 
      !item.productId || !item.discountedPrice || !item.discountAmount || !item.quantity || !item.categoryId
    );
    
    if (invalidItem) {
      return res.status(400).json({ message: "Invalid item details." });
    }
    
    const blockedCategory = await Promise.all(
      cartItems.map(async (item) => {
        const checkCategory = await category.findOne({ 
          categoryTitle: item.categoryId, 
          isblocked: true 
        });
    
        // Return categoryId if it is blocked, otherwise return null
        return checkCategory ? item.categoryId : null;
      })
    );
    
    const blockedCategories = blockedCategory.filter((category) => category !== null);
    
    
    if (blockedCategories.length > 0) {
      return res.status(404).json({ 
        message: `Category ${blockedCategories.join(", ")} is blocked. Please try again later.` 
      });
    }
    
    
    

    let totalDiscountedAmount = 0;

    for (const item of cartItems) {

      const productObjectId = new mongoose.Types.ObjectId(item.productId);

      const collectionName = item.categoryId ? `${item.categoryId}` : 'products';
      


      const product = await mongoose.connection.collection(collectionName).findOne({ _id: productObjectId });

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${item.productId} not found in category ${item.categoryId}.`,
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

      if (couponCode) {
        const couponDetails = await Coupons.find({ code: couponCode, isActive: true });
      
        if (couponDetails.length === 0) {
          return res.status(400).json({ message: "Invalid coupon code" });
        } else {
          const coupon = couponDetails[0];
      
          if (coupon.usedCount < coupon.usageLimit) {
           
            await Coupons.updateOne(
              { code:couponCode, isActive: true },
              { $inc: { usedCount: 1 } }  
            );
      
          } else {
            return res.status(400).json({ message: "Coupon usage limit reached" });
          }
        }
      } else {
        console.log("No coupon code provided, skipping coupon logic.");
      }


      totalDiscountedAmount += parseFloat(item.discountedPrice) * item.quantity;

      await mongoose.connection.collection(collectionName).findOneAndUpdate(
        { _id: productObjectId },
        { $inc: { Stock: -item.quantity } },
        { new: true }
      );
    }

    // Apply the coupon discount if present
    const couponDiscount = req.body.couponDiscount || 0;
    const finalAmount = totalDiscountedAmount + shippingCharge - couponDiscount;

    const couponApplied = couponCode ? true : false;

    const shippingMethod = shippingCharge === 80 ? "express" : "standard";
    if (paymentMethod === "COD" && (finalAmount > 30000 || totalPrice > 30000)) {
      return res.status(500).json({
        success: false,
        message: "Maximum order amount through Cash on Delivery is Rs. 5000",
      });
    }
    
    const UserID = req.session.UserId;
    // Create an order object
    const newOrder = new Orders({
      userId: req.body.userId,  // Assuming userId is provided in the request
      orderedItem: cartItems.map((item) => {
        const actualPrice = parseFloat(item.discountedPrice) + parseFloat(item.discountAmount);  // Assuming actualPrice is the price before discount
        const totalPrice = parseFloat(item.discountedPrice) * item.quantity; // Total price for this item
    
        return {
          categoryId: item.categoryId,
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: totalPrice, // Include the total price for the product
          actualPrice: actualPrice, // Include the actual price before discounts
          DiscountAmount: item.discountAmount
        };
      }),
      userId:UserID,
      deliveryAddress: addressDetails,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: paymentMethod,
      offerDiscount: 0, // Set this to any discount logic you might have, if applicable
      DiscountType: 0, // Set if there's a specific discount type
      couponDiscount: couponDiscount || 0,
      totalDiscount: couponDiscount || 0, // Total discount, can be extended based on other discounts
      deliveryCharge: shippingCharge,
      finalAmount: finalAmount,  // Final amount after all discounts and shipping charges
      actualPrice: totalPrice,  // Total price before discounts (from frontend data)
      shippingMethod: shippingMethod,
      couponCode: couponCode || "",
      couponApplied: couponApplied,
      orderDate: new Date(),
    });
    

    // Save the order to the database
    await newOrder.save();

    

    // Clear the cart after successful order
    await CartModel.updateOne(
      { userId: UserID },
      { $set: { items: [], totalPrice: 0 } }
    );

    // Respond with the created order
    res.status(200).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.log("Error while processing cart payment:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};




const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENTID,
  process.env.PAYPAL_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

export const paypalpayment = async (req, res) => {
  try {
    const userId = req.session.UserId;
    const {
      totalPrice,
      address,
      shippingMethod,
      categoryId,
      productId,
      quantity,
      couponDiscount,
      discount,
      discountType,
      couponCode = "",
    } = req.body;
    const offerDiscount = discount
    

    if (!totalPrice || !address || !categoryId || !productId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

     const productObjectId = new mongoose.Types.ObjectId(productId);

      const collectionName = categoryId ? `${categoryId}` : 'products';
      
    

      const product = await mongoose.connection.collection(collectionName).findOne({ _id: productObjectId });

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${productId} not found in category ${categoryId}.`,
        });
      }

      if (product.Stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product with ID ${item.productId}.`,
        });
      }
      await mongoose.connection.collection(collectionName).updateOne(
        { _id: productObjectId },
        { $inc: { Stock: -quantity } } 
      );
      
      

    let normalizedShippingMethod = "";
    let shippingCharge = 0;
    if (shippingMethod === "Express Shipping") {
      normalizedShippingMethod = "express";
      shippingCharge = 80; 
    } else if (shippingMethod === "Standard Shipping") {
      normalizedShippingMethod = "standard";
      shippingCharge = 0; 
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid shipping method." });
    }

    if (couponCode) {
      const couponDetails = await Coupons.find({ code: couponCode, isActive: true });
    
      if (couponDetails.length === 0) {
        return res.status(400).json({ message: "Invalid coupon code" });
      } else {
        const coupon = couponDetails[0];
    
        if (coupon.usedCount < coupon.usageLimit) {
          await Coupons.updateOne(
            { code:couponCode, isActive: true },
            { $inc: { usedCount: 1 } } 
          );
    
        } else {
          return res.status(400).json({ message: "Coupon usage limit reached" });
        }
      }
    } else {
      console.log("No coupon code provided, skipping coupon logic.");
    }

    let exchangeRate = 0.012; 
    try {
      const exchangeRateResponse = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      exchangeRate = exchangeRateResponse?.data?.rates?.USD || exchangeRate;
    } catch (error) {
      console.error("Error fetching exchange rate:", error.message);
    }

   


    // Calculate discounts and final amount
    const totalDiscount = (parseFloat(couponDiscount) || 0) + (parseFloat(offerDiscount) || 0);

    const finalAmount = (totalPrice + shippingCharge - totalDiscount).toFixed(2);
    const usdValue = (finalAmount * exchangeRate).toFixed(2);



    const newOrder = new Orders({
      userId: userId,
      orderedItem: [
        {
          categoryId: categoryId,
          productId: productId,
          quantity: quantity,
          totalPrice: totalPrice,
          actualPrice: totalPrice + totalDiscount, 
          DiscountAmount: totalDiscount, // Total discounts applied
        },
      ],
      deliveryAddress: address,
      orderStatus: "Pending",
      paymentStatus: "Success",
      paymentMethod: "paypal",
      offerDiscount: offerDiscount,
      couponDiscount: couponDiscount,
      totalDiscount: totalDiscount,
      deliveryCharge: shippingCharge,
      shippingMethod: normalizedShippingMethod,
      finalAmount: finalAmount,
      couponCode: couponCode,
      couponApplied: !!couponCode,
      discountType:discountType,
      actualPrice:totalPrice,
      orderDate: new Date(),
      paypalOrderId:"",
    });

  


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
              full_name: address.label,
            },
            address: {
              address_line_1: address.address,
              admin_area_2: address.city,
              postal_code: address.pinCode,
              country_code: "IN",
            },
          },
          description: `Order for ${quantity} unit(s) of product ID: ${productId} in category: ${categoryId}. Discounts applied: INR ${totalDiscount}.`,
        },
      ],
      application_context: {
        brand_name: "Velo Max",
        locale: "en-US",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `http://localhost:4000/paypalsuccess?orderId=${newOrder._id}`,
        cancel_url: `http://localhost:4000/paypalcancel?orderId=${newOrder.id}`,
      },
    });

    const paypalOrder = await client.execute(request);
    const approvalUrl = paypalOrder.result.links.find(
      (link) => link.rel === "approve"
    )?.href;


    if (!approvalUrl) throw new Error("Approval URL not found.");

    newOrder.paypalOrderId = paypalOrder.result.id;
    await newOrder.save();
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





export const paypalCancel = async (req, res) => {
  try {
    const { orderId } = req.query; // Assuming you pass the orderId in the query parameters

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    const updatedOrder = await Orders.findOneAndUpdate(
      { _id: orderId },
      { $set: { paymentStatus: "Pending" } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }


    const product = await mongoose.connection.collection(updatedOrder.orderedItem[0].categoryId).findOne({ _id: updatedOrder.orderedItem[0].productId });

    if (product) {
      await mongoose.connection.collection(updatedOrder.orderedItem[0].categoryId).updateOne(
        { _id: updatedOrder.orderedItem[0].productId },
        { $inc: { Stock: updatedOrder.orderedItem[0].quantity } }
      );
    }

    const userDetails = await User.findOne({ _id: req.session.UserId });

    res.status(200) .render("User/orderSuccess.ejs", { orderDetails:updatedOrder,userDetails });
  } catch (error) {
    console.error("Error in PayPal cancellation handler:", error);
    res.status(500).json({ success: false, message: "Internal server error during cancellation.", error: error.message });
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


    // Extract custom data (your app's orderId) and PayPal transaction details
    const purchaseUnit = capture.result.purchase_units[0];
    const paypalOrderId = capture.result.id;
    const appOrderId = purchaseUnit.custom_id; // Your application's orderId

    // Retrieve your app's order details using appOrderId
    const orderDetails = await Orders.findOne({ _id: orderId });
    if (!orderDetails) {
      return res.status(404).send("Order not found.");
    }

    const userDetails = await User.findOne({ _id: req.session.UserId });

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
    const userId = req.session?.UserId;

    
    const {
      cartItems, 
      addressDetails,
      shippingCharge = 0,
      couponCode = "",
      couponDiscount = 0,
      shippingMethod,
    } = req.body;


    // Validate essential fields
    if (!Array.isArray(cartItems) || cartItems.length === 0 || !addressDetails || !userId) {
      console.error("Missing required fields: cartItems, addressDetails, or userId.");
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    let totalDiscountedAmount = 0;

    for (const item of cartItems) {
      if (!item.categoryId || !item.productId || !item.quantity) {
        console.error(`Invalid cart item: ${JSON.stringify(item)}`);
        return res.status(400).json({
          success: false,
          message: `Invalid cart item: Missing required fields for product ID ${item.productId}.`,
        });
      }

      // Fetch product from the appropriate category collection
      const productObjectId = new mongoose.Types.ObjectId(item.productId);
      const dynamicCollection = mongoose.connection.collection(item.categoryId);

      const product = await dynamicCollection.findOne({ _id: productObjectId });

      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found in category ${item.categoryId}.`,
        });
      }

      if (product.isblocked) {
        console.error(`Product is blocked: ${item.productId}`);
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} is currently blocked.`,
        });
      }

      if (product.Stock < item.quantity) {
        console.error(`Insufficient stock for product ID ${item.productId}.`);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ID ${item.productId}.`,
        });
      }
      

      totalDiscountedAmount += parseFloat(item.discountedPrice) * item.quantity;
    }

    if (couponCode) {
      const couponDetails = await Coupons.find({ code: couponCode, isActive: true });
    
      if (couponDetails.length === 0) {
        return res.status(400).json({ message: "Invalid coupon code" });
      } else {
        const coupon = couponDetails[0];
    
        // Check if the coupon can still be used (usage limit not reached)
        if (coupon.usedCount < coupon.usageLimit) {
          // Proceed to update the usedCount
          await Coupons.updateOne(
            { code:couponCode, isActive: true },
            { $inc: { usedCount: 1 } }  // Increment usedCount by 1
          );
    
        } else {
          return res.status(400).json({ message: "Coupon usage limit reached" });
        }
      }
    } else {
      console.log("No coupon code provided, skipping coupon logic.");
    }

    // Fetch the latest INR to USD exchange rate
    let exchangeRate = 0.012; // Fallback rate
    try {
      const exchangeRateResponse = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      exchangeRate = exchangeRateResponse?.data?.rates?.USD || exchangeRate;
    } catch (error) {
      console.error("Error fetching exchange rate:", error.message);
    }

    // Calculate final amounts
    const finalAmountInINR = totalDiscountedAmount + shippingCharge - couponDiscount;
    const usdValue = (finalAmountInINR * exchangeRate).toFixed(2);

    const shippingMethodType = shippingCharge === 80 ? "express" : "standard";

    // Save the order details to the database
    const newOrder = new Orders({
      userId,
      orderedItem: cartItems.map((item) => {
        const actualPrice =
          parseFloat(item.discountedPrice) + parseFloat(item.discountAmount); // Price before discount
        const totalPrice = parseFloat(item.discountedPrice) * item.quantity; // Total price after discount

        return {
          categoryId: item.categoryId,
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: totalPrice.toFixed(2), // Ensure consistent formatting
          actualPrice: actualPrice.toFixed(2), // Actual price before discounts
          DiscountAmount: parseFloat(item.discountAmount).toFixed(2), // Discount amount
        };
      }),
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
      offerDiscount: 0, // Add your own discount logic if needed
      DiscountType: 0,
      couponDiscount: parseFloat(couponDiscount).toFixed(2),
      totalDiscount: (parseFloat(couponDiscount) + cartItems.reduce(
        (sum, item) => sum + parseFloat(item.discountAmount || 0), 0
      )).toFixed(2), // Sum of all discounts
      deliveryCharge: parseFloat(shippingCharge).toFixed(2),
      finalAmount: finalAmountInINR.toFixed(2),
      actualPrice: cartItems.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.discountedPrice) * item.quantity +
          parseFloat(item.discountAmount) * item.quantity,
        0
      ).toFixed(2), // Total price before discounts
      shippingMethod: shippingMethodType,
      couponCode: couponCode || "",
      couponApplied: !!couponCode,
      orderDate: new Date(),
      paypalOrderId:''
    });

    


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

    if (!approvalUrl) {
      throw new Error("Approval URL not found.");
    }
    newOrder.paypalOrderId = paypalOrder.result.id;
    await newOrder.save();
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



// Assuming you've already initialized PayPal client (e.g., `client`)
export const repayPaypal = async (req, res) => {
  try {
    const { userId, _id } = req.body;

    if (!userId || !_id) {
      return res.status(400).json({ success: false, message: "Missing userId or orderId." });
    }

    const orderId = new mongoose.Types.ObjectId(_id);
    const order = await Orders.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.paymentStatus !== "Pending") {
      return res.status(400).json({ success: false, message: "Payment already completed or canceled." });
    }

    // Proceed to create a PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: order.finalAmount,
          },
          shipping: {
            name: {
              full_name: order.deliveryAddress.label,
            },
            address: {
              address_line_1: order.deliveryAddress.address,
              admin_area_2: order.deliveryAddress.city,
              postal_code: order.deliveryAddress.pinCode,
              country_code: "IN",
            },
          },
          description: `Order containing ${order.orderedItem.length} items`,
        },
      ],
      application_context: {
        brand_name: "Velo Max",
        locale: "en-US",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `http://localhost:4000/paypalsuccess?orderId=${order._id}`,
        cancel_url: `http://localhost:4000/paypalcancel`,
      },
    });

    const paypalOrder = await client.execute(request);
    const approvalUrl = paypalOrder.result.links.find(
      (link) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      throw new Error("Approval URL not found.");
    }

    // Save the PayPal orderId in the order object for future reference
    order.paypalOrderId = paypalOrder.result.id;

    // Update the payment status to "Success"
    order.paymentStatus = "Success"; // Change status to Success
    await order.save();

    res.status(200).json({ success: true, approvalUrl });
  } catch (error) {
    console.error("Error during PayPal repayment:", error.message);
    res.status(500).json({
      success: false,
      message: "Error during PayPal repayment.",
      error: error.message,
    });
  }
};



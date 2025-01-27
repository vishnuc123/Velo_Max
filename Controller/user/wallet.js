import errorHandler from "../../Error-Reporter.js";
import Wallet from "../../Models/User/wallet.js";
import paypal from "@paypal/checkout-server-sdk"
import dotenv from 'dotenv'
dotenv.config();
import axios from "axios";
import Orders from "../../Models/User/Order.js";
import mongoose from "mongoose";
import CartModel from "../../Models/User/cart.js";
import Coupons from "../../Models/Admin/coupon.js"


dotenv.config();


export const walletStatus = async (req, res) => {
  try {
    const userId = req.session.UserId;
    if (!userId) {
      return res
        .status(401)
        .json({ status: "error", message: "Unauthorized. Please log in." });
    }

    // Check if the wallet exists for the user
    let userWallet = await Wallet.findOne({ userId });

    if (!userWallet) {
      // If wallet does not exist, create it
      userWallet = new Wallet({
        userId,
        walletStatus: true, // Unlock wallet by default
        balance: 0,
        walletHistory: [],
      });
      await userWallet.save();
      return res
        .status(200)
        .json({
          status: "success",
          message: "Wallet created and unlocked successfully",
          walletStatus: userWallet.walletStatus,
        });
    }

    if (!userWallet.walletStatus) {
      // If wallet exists and is locked, unlock it
      userWallet.walletStatus = true;
      await userWallet.save();
      return res
        .status(200)
        .json({
          status: "success",
          message: "Wallet unlocked successfully",
          walletStatus: userWallet.walletStatus,
        });
    }

    // If wallet is already unlocked, return status with a message
    res
      .status(200)
      .json({
        status: "success",
        message: "Wallet is already unlocked",
        walletStatus: userWallet.walletStatus,
      });
  } catch (error) {
    console.error("Error handling wallet status:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to handle wallet status.",
        error: error.message,
      });
  }
};

export const getBalance = async (req,res,next) => {
    try {
        const userId = req.session.UserId
        const walletDetails = await Wallet.findOne({userId:userId})
        console.log(walletDetails);
        
        res.status(200).json({walletDetails:walletDetails})        
    } catch (error) {
        next(error)
    }
}


export const getAddMoneyPage = async (req,res,next) => {
    try {
        res.render('User/addMoney.ejs')
    } catch (error) {
        next(error)
    }
}

const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENTID,
    process.env.PAYPAL_SECRET
  );
  const client = new paypal.core.PayPalHttpClient(environment);


  

// Function to fetch exchange rate from INR to USD
const fetchExchangeRate = async () => {
    let exchangeRate;
    try {
        const exchangeRateResponse = await axios.get(
            "https://api.exchangerate-api.com/v4/latest/INR"
        );
        exchangeRate = exchangeRateResponse?.data?.rates?.USD || 0.012; // Fallback rate if API fails
    } catch (error) {
        console.error("Error fetching exchange rate:", error.message);
        exchangeRate = 0.012; // Fallback rate in case of an error
    }
    return exchangeRate;
};

export const addMoneyToWallet = async (req, res, next) => {
    try {
        const userId = req.session.UserId;
        const { amount } = req.body; // amount should be in INR
        console.log(req.body);

        // Validate userId and amount
        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount or user ID" });
        }

        // Fetch exchange rate for INR to USD
        const exchangeRate = await fetchExchangeRate();
        
        // Convert the amount from INR to USD
        const amountInUSD = (amount * exchangeRate).toFixed(2); // Convert INR to USD
        
        // Create PayPal order
        const createOrderRequest = new paypal.orders.OrdersCreateRequest();
        createOrderRequest.prefer('return=representation');
        createOrderRequest.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD', // Use USD currency for PayPal
                        value: amountInUSD, // Converted amount in USD
                    },
                },
            ],
            application_context: {
                brand_name: 'Your E-commerce Name',
                return_url: `http://localhost:4000/paypal/AddMoneySuccess?userId=${userId}&amount=${amount}`, // Redirect URL after payment
                cancel_url: 'http://localhost:4000/paypal/cancel', // Redirect URL if payment is canceled
            },
        });

        // Execute PayPal order creation
        const paypalOrder = await client.execute(createOrderRequest);

        // Find approval link for the payment
        const approvalUrl = paypalOrder.result.links.find(link => link.rel === 'approve')?.href;
        if (!approvalUrl) {
            return res.status(500).json({ success: false, message: 'Approval URL not found.' });
        }

        // Send approval URL back to the client for redirection
        res.status(200).json({ success: true, approvalUrl });

    } catch (error) {
        console.error('Error creating PayPal order:', error);
        next(error);
    }
};

export const AddMoneySuccess = async (req, res, next) => {
    try {
      const { amount } = req.query;  // Get userId and amount from the query string
      const { PayerID, token } = req.query;
      const userId = req.session.UserId  // Get the Payer ID and payment token from the URL parameters
  
      // Check if required parameters are provided
      if (!userId || !amount || !PayerID || !token) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
      }
  
      // Create the request to capture the payment
      const capturePaymentRequest = new paypal.orders.OrdersCaptureRequest(token);
      capturePaymentRequest.requestBody({});
  
      // Execute the capture payment request
      const captureResponse = await client.execute(capturePaymentRequest);
  
      // Check if the payment is successful
      if (captureResponse.result.status === 'COMPLETED') {
        // Find the wallet associated with the userId
        const walletDetails = await Wallet.findOne({ userId: userId });  // Correct way to find the wallet
        if (!walletDetails) {
          return res.status(404).json({ success: false, message: "Payment successful, but unable to find wallet details" });
        }
  
        const walletBalanceBefore = walletDetails.balance;
        const amountToAdd = parseFloat(amount);
  
        // Add the amount to the wallet balance
        walletDetails.balance += amountToAdd;
  
        const walletBalanceAfter = walletDetails.balance;
  
        // Add the transaction to the wallet history
        walletDetails.walletHistory.push({
          transactionType: "credit",  // Transaction type is "credit" since we're adding money
          amount: amountToAdd,
          description: `${amountToAdd} added to the wallet`,  // Updated description with actual amount
          date: new Date(),

        });
  
        // Save the updated wallet details to the database
        await walletDetails.save();
  
        // Send a success response with the updated balance
        res.status(200).json({
          success: true,
          message: 'Payment successful. Wallet updated.',
          updatedBalance: walletDetails.balance,  // Return the updated balance
        });
      } else {
        // If the payment is not successful
        res.status(500).json({ success: false, message: 'Payment failed. Please try again later.' });
      }
  
    } catch (error) {
      console.error('Error during PayPal payment capture:', error);
      next(error);  // Pass the error to the next middleware or error handler
    }
  };
  


// wallet payment
export const walletPayment = async (req, res) => {
  try {
    console.log(req.body);

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
      discount = 0,
      couponCode,
      couponDiscount = 0,
    } = req.body;

    // Validate inputs
    if (!categoryId || !productId || !quantity || !totalPrice || !address) {
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

    // Fetch user wallet balance
    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet) {
      return res.status(404).json({
        success: false,
        message: "User wallet not found.",
      });
    }

    const walletBalanceBefore = userWallet.balance;

    // Check if the wallet has sufficient balance
    if (walletBalanceBefore < totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance.",
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
    
          console.log("Coupon usage success, incremented used count");
        } else {
          return res.status(400).json({ message: "Coupon usage limit reached" });
        }
      }
    } else {
      console.log("No coupon code provided, skipping coupon logic.");
    }

    // Update product stock
    await dynamicCollection.findOneAndUpdate(
      { _id: productObjectId },
      { $inc: { Stock: -quantity } },
      { new: true }
    );

    // Calculate actual price and discounts
    const actualPrice = product.ListingPrice * quantity;
    const parsedDiscount = parseFloat(discount) || 0;
    const parsedCouponDiscount = parseFloat(couponDiscount) || 0;
    const totalDiscount = parsedDiscount + parsedCouponDiscount;

    // Calculate delivery charge
    const deliveryCharge = shippingMethod === "Express Shipping" ? 80 : 0;

    // Calculate final amount
    const calculatedFinalAmount = actualPrice - totalDiscount + deliveryCharge;

    // Validate total price
    if (Math.abs(totalPrice - calculatedFinalAmount) > 1) {
      return res.status(400).json({
        success: false,
        message: "Mismatch in calculated total price. Please verify the order details.",
      });
    }

    // Determine shipping method enum
    const shippingEnum = shippingMethod === "Express Shipping" ? "express" : "standard";

    // Create order document
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
      orderStatus: "Pending",
      paymentStatus: "Success",
      paymentMethod: "wallet",
      offerDiscount: parsedDiscount,
      discountType: null,
      couponDiscount: parsedCouponDiscount,
      totalDiscount,
      deliveryCharge,
      finalAmount: calculatedFinalAmount,
      actualPrice,
      shippingMethod: shippingEnum,
      couponCode,
      couponApplied: !!couponCode,
      cancelled: false,
      returned: false,
      orderDate: new Date(),
      invoiceDate: new Date(),
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Deduct wallet balance and log transaction
    userWallet.balance -= calculatedFinalAmount;
    userWallet.walletHistory.push({
      transactionType: "debit",
      amount: calculatedFinalAmount,
      date: new Date(),
      description: `Payment for Order ID: ${savedOrder._id}`,
    });

    // Save updated wallet details
    await userWallet.save();

    return res.status(200).json({
      success: true,
      message: "Order processed successfully using wallet payment.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error processing wallet payment:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the order with wallet payment.",
    });
  }
};

export const cartWalletPayment = async (req, res) => {
  try {
    // Extract data from the request body
    console.log("Request Body:", req.body);
    
    const {
      email,
      addressDetails,
      shippingCharge = 0,
      cartItems,  // Changed to cartItems as per your request body
      couponCode = "",
      couponDiscount = 0,
      paymentMethod,
    } = req.body;

    if (!email || !addressDetails || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log("Invalid data provided in the request body.");
      return res.status(400).json({ success: false, message: "Invalid data provided." });
    }

    // Initialize variables
    let totalDiscountedAmount = 0;

    // Debugging the cart items
    console.log("Cart Items:", cartItems);

    // Validate and process each cart item
    for (const item of cartItems) {
      console.log("Processing item:", item);

      if (!item.categoryId || !item.productId || !item.quantity || !item.discountedPrice) {
        console.log(`Invalid cart item: Missing required fields for product ID ${item.productId}.`);
        return res.status(400).json({
          success: false,
          message: `Invalid cart item: Missing required fields for product ID ${item.productId}.`,
        });
      }

      const productObjectId = new mongoose.Types.ObjectId(item.productId);
      const dynamicCollection = mongoose.connection.collection(item.categoryId);

      // Fetch the product from the dynamic collection
      const product = await dynamicCollection.findOne({ _id: productObjectId });

      if (!product) {
        console.log(`Product with ID ${item.productId} not found in category ${item.categoryId}.`);
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found in category ${item.categoryId}.`,
        });
      }

      if (product.isblocked) {
        console.log(`Product with ID ${item.productId} is blocked.`);
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} is currently blocked.`,
        });
      }

      if (product.Stock < item.quantity) {
        console.log(`Insufficient stock for product with ID ${item.productId}.`);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product with ID ${item.productId}.`,
        });
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
      
            console.log("Coupon usage success, incremented used count");
          } else {
            return res.status(400).json({ message: "Coupon usage limit reached" });
          }
        }
      } else {
        console.log("No coupon code provided, skipping coupon logic.");
      }
      

      // Calculate the total discounted amount for the cart
      const itemTotal = parseFloat(item.discountedPrice) * item.quantity;
      console.log(`Item ID ${item.productId} Total Discounted Amount:`, itemTotal);
      totalDiscountedAmount += itemTotal;
    }

    console.log("Total Discounted Amount:", totalDiscountedAmount);

    // Calculate the final amount after shipping and coupon discount
    const finalAmount = totalDiscountedAmount + shippingCharge - couponDiscount;
    console.log("Final Amount (including shipping and coupon):", finalAmount);

    const couponApplied = !!couponCode;
    const shippingMethod = shippingCharge === 80 ? "express" : "standard";
    
    console.log("Shipping Method:", shippingMethod);
    console.log("Coupon Applied:", couponApplied);

    // Check and update wallet balance
    const wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet || !wallet.walletStatus) {
      console.log("Wallet is not active.");
      return res.status(400).json({ success: false, message: "Wallet is not active." });
    }

    console.log("Wallet Balance:", wallet.balance);
    if (wallet.balance < finalAmount) {
      console.log("Insufficient wallet balance.");
      return res.status(400).json({ success: false, message: "Insufficient wallet balance." });
    }

    // Deduct wallet balance and update wallet history
    wallet.balance -= finalAmount;
    console.log("Updated Wallet Balance after deduction:", wallet.balance);

    wallet.walletHistory.push({
      transactionType: "debit",
      amount: finalAmount,
      description: "Purchase payment using wallet",
      date: new Date(),
    });

    // Save the wallet changes
    await wallet.save();
    console.log("Wallet history updated and saved.");

    // Update product stock
    for (const item of cartItems) {
      const productObjectId = new mongoose.Types.ObjectId(item.productId);
      const dynamicCollection = mongoose.connection.collection(item.categoryId);

      const updatedProduct = await dynamicCollection.findOneAndUpdate(
        { _id: productObjectId },
        { $inc: { Stock: -item.quantity } },
        { new: true }
      );
      console.log(`Product ID ${item.productId} stock updated:`, updatedProduct);
    }

    // Create the order object
    const newOrder = new Orders({
      userId: req.user._id,  // Assuming userId is available from authentication
      orderedItem: cartItems.map((item) => {
        const actualPrice = parseFloat(item.discountedPrice) + parseFloat(item.discountAmount || 0);
        const totalPrice = parseFloat(item.discountedPrice) * item.quantity;

        console.log(`Order Item - Product ID: ${item.productId}, Total Price: ${totalPrice.toFixed(2)}`);
        return {
          categoryId: item.categoryId,
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: totalPrice.toFixed(2),
          actualPrice: actualPrice.toFixed(2),
          DiscountAmount: parseFloat(item.discountAmount || 0).toFixed(2),
        };
      }),
      deliveryAddress: addressDetails,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: paymentMethod,
      offerDiscount: 0, // Set this to any discount logic you might have
      DiscountType: 0, // Set if there's a specific discount type
      couponDiscount: parseFloat(couponDiscount).toFixed(2),
      totalDiscount: (parseFloat(couponDiscount) + cartItems.reduce(
        (sum, item) => sum + parseFloat(item.discountAmount || 0),
        0
      )).toFixed(2),
      deliveryCharge: parseFloat(shippingCharge).toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      actualPrice: cartItems.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.discountedPrice) * item.quantity +
          parseFloat(item.discountAmount || 0) * item.quantity,
        0
      ).toFixed(2),
      shippingMethod: shippingMethod,
      couponCode: couponCode || "",
      couponApplied: couponApplied,
      orderDate: new Date(),
    });

    console.log("Order Object:", newOrder);

    // Save the order to the database
    await newOrder.save();
    console.log("Order saved successfully.");

    // Clear the cart after successful order
    await CartModel.updateOne(
      { userId: req.user._id },
      { $set: { items: [], totalPrice: 0 } }
    );

    // Respond with the created order
    res.status(200).json({ success: true, message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Error while processing wallet cart payment:", error);
    res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};


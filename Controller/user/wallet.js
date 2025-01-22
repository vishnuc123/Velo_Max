import errorHandler from "../../Error-Reporter.js";
import Wallet from "../../Models/User/wallet.js";
import paypal from "@paypal/checkout-server-sdk"
import dotenv from 'dotenv'
dotenv.config();
import axios from "axios";
import Orders from "../../Models/User/Order.js";
import mongoose from "mongoose";
import Users from "../../Models/User/UserDetailsModel.js";
import CartModel from "../../Models/User/cart.js";


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
        } = req.body;

        // Validate inputs
        if (
            !categoryId ||
            !productId ||
            !quantity ||
            !totalPrice ||
            !address
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

        // Fetch user wallet balance
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const userWallet = await Wallet.findOne({ userId: userId });
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

        // Calculate final amount
        const deliveryCharge = shippingMethod === "Express Shipping" ? 80 : 0;
        const finalAmount = totalPrice + deliveryCharge;
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
            paymentMethod: "wallet",
            paymentStatus: "Success",
            offerDiscount: 0,
            couponDiscount: 0,
            totalDiscount: 0,
            deliveryCharge,
            finalAmount,
            shippingMethod: shippingEnum,
            couponCode: null,
            couponApplied: false,
        });

        // Save the order
        const savedOrder = await newOrder.save();

        // Deduct wallet balance after the order has been successfully placed
        userWallet.balance -= totalPrice;

        // Calculate the difference between the previous balance and the new balance
        const walletBalanceAfter = userWallet.balance;
        const amountDeducted = walletBalanceBefore - walletBalanceAfter;

        // Add transaction to the wallet history with the previous balance and the deducted amount
        userWallet.walletHistory.push({
            transactionType: "debit",
            amount: amountDeducted,
            date: new Date(),
            description: `Payment for Order ID: ${savedOrder._id}`,
        });

        // Save the updated wallet details to the database
        await userWallet.save();
        console.log(userWallet);

        // Respond with success
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
      const { email, addressDetails, shippingCharge, cartdata, paymentMethod } = req.body;
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
  
      // Validate stock, check if product is blocked, and update stock
      for (const item of items) {
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
          { new: true }
        );
      }
  
      // Check and update wallet balance
      const wallet = await Wallet.findOne({ userId: userId });
  
      if (!wallet || !wallet.walletStatus) {
        return res.status(400).json({ message: "Wallet is not active." });
      }
  
      if (wallet.balance < finalAmount) {
        return res.status(400).json({ message: "Insufficient wallet balance." });
      }
  
      // Deduct the wallet balance and update wallet history
      wallet.balance -= finalAmount;
      wallet.walletHistory.push({
        transactionType: "debit",
        amount: finalAmount,
        description: "Purchase payment using wallet",
        date: new Date(),
      });
  
      
  
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
        paymentStatus: "Success",
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
      await wallet.save();
      // Clear the cart after successful order
      await CartModel.updateOne(
        { userId: userId },
        { $set: { items: [], totalPrice: 0 } }
      );
  
      // Respond with the created order
      res
        .status(200)
        .json({ message: "Order placed successfully!", order: newOrder });
    } catch (error) {
      console.log("Error while processing wallet cart payment:", error);
      res
        .status(500)
        .json({ message: "Internal server error. Please try again later." });
    }
  };
  
  export const removeFromWishlist = async (req,res,next) => {
    try {
      console.log("remove product Id",req.body.productId)
    } catch (error) {
      next(error)
    }
  }
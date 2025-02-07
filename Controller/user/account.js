import User from "../../Models/User/UserDetailsModel.js";
import { Address } from "../../Models/User/userAddress.js";
import Orders from "../../Models/User/Order.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const loadAccount = async (req, res) => {
  try {
    const userId = req.session.UserId;
    const userData = await User.find({ _id: userId });

    res.render("User/account.ejs", { userDetails: userData });
  } catch (error) {
    console.log("error while getting account", error);
  }
};

export const loadOrders = async (req, res) => {
  try {
    res.render("User/orders.ejs");
  } catch (error) {}
};

export const loadAddress = async (req, res) => {
  try {
    res.render("User/address.ejs");
  } catch (error) {}
};
export const loadWallet = async (req, res) => {
  try {
    res.render("User/wallet.ejs");
  } catch (error) {}
};

export const submitAddress = async (req, res) => {
  try {
    const userId = req.session.UserId;

    if (!userId) {
      console.error("Unauthorized: No userId in session.");
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { label, address, city, pinCode, phoneNumber } = req.body;

    if (!label || !address || !city || !pinCode || !phoneNumber) {
      console.error("Validation Error: Missing required fields.");
      return res.status(400).json({ message: "All fields are required." });
    }

    const newAddress = new Address({
      userId,
      label,
      address,
      city,
      pinCode,
      phoneNumber,
    });

    // Save to the database
    await newAddress.save();

    res.json({ message: "Address added successfully." });
  } catch (error) {
    console.error("Error while submitting address:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const userId = req.session.UserId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const addresses = await Address.find({ userId });
    res.json({ addresses });
  } catch (error) {
    console.log("error while getting address", error);
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.session.UserId;

    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 10;

    const maxLimit = 100;
    if (limit > maxLimit) limit = maxLimit;

    const skip = (page - 1) * limit;

    const totalOrders = await Orders.countDocuments({ userId });

    const orders = await Orders.find({ userId }).skip(skip).limit(limit);

    res.json({
      totalOrders,
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(totalOrders / limit),
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderProductDetail = async (req, res) => {
  try {
    const userId = req.session.UserId;

    const orderDetails = await Orders.find({ userId: userId });

    if (!orderDetails || orderDetails.length === 0) {
      return res
        .status(404)
        .send({ message: "No orders found for this user." });
    }

    const enrichedOrderDetails = [];

    for (const order of orderDetails) {
      const enrichedOrderedItems = [];

      for (const item of order.orderedItem) {
        const { categoryId, productId } = item;

        const collections = await mongoose.connection.db
          .listCollections()
          .toArray();
        const existingCollectionNames = collections.map((col) => col.name);

        if (!existingCollectionNames.includes(categoryId)) {
          return res
            .status(404)
            .json({
              message: `Collection for category \"${categoryId}\" does not exist.`,
            });
        }

        const productCollection = mongoose.connection.db.collection(categoryId);

        const productData = await productCollection.findOne({
          _id: new mongoose.Types.ObjectId(productId),
        });

        enrichedOrderedItems.push({
          ...item,
          productData: productData || null,
        });
      }

      enrichedOrderDetails.push({
        ...order.toObject(),
        orderedItem: enrichedOrderedItems,
      });
    }

    res.json(enrichedOrderDetails);
  } catch (error) {
    console.error("Error while getting product details:", error);
    res.status(500).json({ message: "Error fetching order details" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.session.userId;
    const userDetails = await User.find({ _id: userId });
    res.status(201).json({ userDetails });
  } catch (error) {
    console.log("error while getting data from the user");
  }
};

export const validateOldPassword = async (req, res) => {
  try {
    if (!req.session || !req.session.UserId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    const userId = req.session.UserId;
    const { oldPassword } = req.body;

    if (!oldPassword) {
      return res.status(400).json({ message: "Old password is required" });
    }

    const userDetails = await User.findOne({ _id: userId });

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userDetails.password) {
      return res.status(500).json({ message: "Password not set for user" });
    }

    const isMatch = await bcrypt.compare(oldPassword, userDetails.password);

    if (isMatch) {
      return res.status(200).json({ isValid: true });
    } else {
      return res
        .status(401)
        .json({ isValid: false, message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error validating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitAccountDetails = async (req, res) => {
  try {
    const userId = req.session.UserId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required." });
    }
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      return res
        .status(400)
        .json({
          message:
            "New password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.",
        });
    }

 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }


    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.password
    );
    if (isSameAsOldPassword) {
      return res
        .status(400)
        .json({
          message: "New password cannot be the same as the old password.",
        });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

   
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error while submitting account details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateAddresses = async (req, res) => {
  try {
    const userId = req.session.UserId;
    const addressId = req.params.addressId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { label, address, city, pinCode, phoneNumber } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, userId: userId },
      {
        label,
        address,
        city,
        pinCode,
        phoneNumber,
      },
      { new: true } 
    );

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    res.status(200).json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error while updating the address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editAccountName = async (req, res) => {
  try {
    const { firstname, lastname } = req.body; 
    const userId = req.session.UserId; 

    
    if (!firstname || !lastname) {
      return res
        .status(400)
        .json({ message: "First Name and Last Name are required." });
    }


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstname, lastname },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({
        message: "Account name updated successfully.",
        user: updatedUser,
      });
  } catch (error) {
    console.error("Error while submitting account name:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating account name." });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.session.UserId;
    const addressId = req.params.addressId; 

 
    const addressObjectId = new mongoose.Types.ObjectId(addressId);

    const address = await Address.findOne({ userId: userId });

    if (!address) {
      return res
        .status(404)
        .json({ message: "Address not found or does not belong to this user" });
    }


    await Address.findByIdAndDelete(addressObjectId);


    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.log("Error while deleting the address", error);
    res.status(500).json({ message: "Error deleting address" });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const userId = req.session.UserId; 
    const { orderId, reason, customReason, productId } = req.body;

  
    const returnReason =
      reason === "Other" && customReason
        ? `Custom reason: ${customReason}`
        : reason;

    const order = await Orders.findOne({ _id: orderId, userId: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderedItemIndex = order.orderedItem.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (orderedItemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Product not found in this order" });
    }

    const updateResult = await Orders.updateOne(
      {
        _id: orderId,
        "orderedItem.productId": productId, 
      },
      {
        $set: {
          "orderedItem.$.status": "Return-pending", 
        },
      }
    );

    order.orderedItem[orderedItemIndex].returnRequest = {
      status: "Pending",
      reason: returnReason,
      requestedAt: new Date(),
      updatedAt: new Date(),
    };

    order.orderedItem[orderedItemIndex].status = "Return-pending";

    const updatedOrder = await order.save();

    if (updatedOrder) {
      res
        .status(200)
        .json({
          message: "Return request successfully created",
          order: updatedOrder,
        });
    } else {
      res.status(500).json({ message: "Failed to update order" });
    }
  } catch (error) {
    console.log("Error while processing return order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSpecificOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

   
    const order = await Orders.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error while getting order details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

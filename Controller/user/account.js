
import User from "../../Models/User/UserDetailsModel.js";
import { Address } from "../../Models/User/userAddress.js";
import Orders from "../../Models/User/Order.js";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';


export const loadAccount = async (req,res) => {
    try {
        const userId = req.session.UserId
        const userData  = await User.find({_id:userId})
        // console.log(userData);
        
        
        res.render('User/account.ejs',{userDetails:userData})
        
    } catch (error) {
        console.log("error while getting account",error);
        
    }
}

export const loadOrders = async (req,res) => {
    try {
        res.render('User/orders.ejs')
    } catch (error) {
        
    }
}


export const loadAddress = async (req,res) => {
    try {
        res.render('User/address.ejs')
        
    } catch (error) {
        
    }
}
export const loadWallet = async (req,res) => {
    try {
        res.render('User/wallet.ejs')
    } catch (error) {
        
    }
}



export const submitAddress = async (req,res) => {
    try {
        // Extract userId from the session
        const userId = req.session.UserId;
    
        // Validate if userId exists in the session
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }
    
        // Extract address data from the request body
        const { label, address, city, pinCode ,phoneNumber } = req.body;
        console.log(req.body);
        
    
        // Validate required fields
        if (!label || !address || !city || !pinCode || !phoneNumber) {
          return res.status(400).json({ message: 'All fields are required.' });
        }
    
        // Create a new address document
        const newAddress = new Address({
          userId,
          label,
          address,
          city,
          pinCode,
          phoneNumber
        });
    
        // Save to the database
        await newAddress.save();
    
        // Send success response
        res.json({ message: 'Address added successfully.' });
      } catch (error) {
        console.error('Error while submitting address:', error);
        res.status(500).json({ message: 'Internal server error.' });
      }
}

export const getAddresses = async (req,res) =>{
    try {
        const userId = req.session.UserId;

        // Check if user is logged in
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        // Fetch the user's addresses from the database
        const addresses = await Address.find({ userId });
        res.json({addresses})
    } catch (error) {
        console.log('error while getting address',error);
        
    }
}



// orders
export const getOrders = async (req, res) => {
    try {
      const userId = req.session.UserId; // Assuming session has userId
  
      // Fetch pagination and sorting values from query params
      const { page = 1, limit = 10, sortBy = 'orderId' } = req.query;
  
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
  
      // Get total number of orders for pagination
      const totalOrders = await Orders.countDocuments({ userId });
  
      // Fetch orders with pagination and sorting
      const orders = await Orders.find({ userId })
        .sort({ [sortBy]: 1 }) // Sorting based on the field specified in the query params
        .skip(skip)
        .limit(parseInt(limit));
  
      // Return the orders and pagination info
      res.json({
        totalOrders,    // Total count of orders
        orders,         // Paginated orders for the current page
        totalPages: Math.ceil(totalOrders / limit), // Total pages for pagination
        currentPage: page // Current page number
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  
  export const getOrderProductDetail = async (req, res) => {
    try {
        const userId = req.session.UserId; // Get the UserId from the session

        // Fetch the order details for the specific user
        const orderDetails = await Orders.find({ userId: userId });
        // console.log(orderDetails);

        if (!orderDetails || orderDetails.length === 0) {
            return res.status(404).send({ message: "No orders found for this user." });
        }

        const enrichedOrderDetails = [];

        // Loop through each order
        for (const order of orderDetails) {
            const enrichedOrderedItems = [];

            // Process each item in the orderedItem array
            for (const item of order.orderedItem) {
                const { categoryId, productId } = item;

                // List all collections in the database
                const collections = await mongoose.connection.db.listCollections().toArray();
                const existingCollectionNames = collections.map(col => col.name);

                // Check if the collection for the categoryId exists
                if (!existingCollectionNames.includes(categoryId)) {
                    return res.status(404).json({ message: `Collection for category \"${categoryId}\" does not exist.` });
                }

                // Access the collection based on categoryId
                const productCollection = mongoose.connection.db.collection(categoryId);

                // Find the product in the relevant collection using productId
                const productData = await productCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });

                // Push enriched item data
                enrichedOrderedItems.push({
                    ...item,
                    productData: productData || null // Add product data if found, or null if not
                });
            }

            // Add the enriched order details to the final array
            enrichedOrderDetails.push({
                ...order.toObject(),
                orderedItem: enrichedOrderedItems
            });
        }

        // Return the enriched order details with product data
        res.json(enrichedOrderDetails);
    } catch (error) {
        console.error("Error while getting product details:", error);
        res.status(500).json({ message: "Error fetching order details" });
    }
};
  

  export const getUserDetails = async (req,res) => {
    try {
      const userId = req.session.userId
      const userDetails = await User.find({_id:userId})
      res.status(201).json({userDetails})
    } catch (error) {
      console.log("error while getting data from the user");
      
    }
  }



  export const validateOldPassword = async (req, res) => {
    try {
      if (!req.session || !req.session.UserId) {
        return res.status(401).json({ message: "Unauthorized: User not logged in" });
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
        return res.status(401).json({ isValid: false, message: "Incorrect password" });
      }
    } catch (error) {
      console.error("Error validating password:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const submitAccountDetails = async (req,res) => {
    try {
      const userId = req.session.UserId; // Get the user ID from the session
      const { oldPassword, newPassword } = req.body; // Destructure the old and new passwords from the request body
  
      // Check if required fields are present
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required.' });
      }
  
      // Validate new password strength
      const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
      if (!passwordPattern.test(newPassword)) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.' });
      }
  
      // Fetch the user's details from the database
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Compare the old password with the hashed password in the database
      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Old password is incorrect.' });
      }
  
      // Ensure new password is not the same as the old password
      const isSameAsOldPassword = await bcrypt.compare(newPassword, user.password);
      if (isSameAsOldPassword) {
        return res.status(400).json({ message: 'New password cannot be the same as the old password.' });
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password in the database
      user.password = hashedNewPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
      console.error('Error while submitting account details:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }


  export const updateAddresses = async (req, res) => {
    try {
      const userId = req.session.UserId;
      const addressId = req.params.addressId
  
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      const { label, address, city, pinCode, phoneNumber } = req.body;
  
      if (!addressId) {
        return res.status(400).json({ message: "Address ID is required" });
      }
  
      const updatedAddress = await Address.findOneAndUpdate(
        { _id: addressId, userId: userId }, // Ensure the address belongs to the logged-in user
        {
          label,
          address,
          city,
          pinCode,
          phoneNumber,
        },
        { new: true } // Return the updated document
      );
  
      if (!updatedAddress) {
        return res.status(404).json({ message: "Address not found or unauthorized" });
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
      const { firstname, lastname } = req.body; // Extract data from the request body
      const userId = req.session.UserId; // Retrieve the user ID from the session
  
      // Validate input
      if (!firstname || !lastname) {
        return res.status(400).json({ message: "First Name and Last Name are required." });
      }
  
      // Update the user details in the database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { firstname, lastname },
        { new: true } // Return the updated document
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
  
      console.log("User details updated successfully:", updatedUser);
      res.status(200).json({ message: "Account name updated successfully.", user: updatedUser });
    } catch (error) {
      console.error("Error while submitting account name:", error);
      res.status(500).json({ message: "An error occurred while updating account name." });
    }
  };


  export const deleteAddress = async (req, res) => {
    try {
      const userId = req.session.UserId; // Getting the logged-in user's ID from session
      const addressId = req.params.addressId;   // Getting the address ID from the request params
  
      // Convert addressId to ObjectId
      const addressObjectId = new mongoose.Types.ObjectId(addressId);
  
      // Find the address by addressId and userId
      const address = await Address.findOne({ userId: userId });
  
      if (!address) {
        return res.status(404).json({ message: 'Address not found or does not belong to this user' });
      }
  
      // Delete the address
      await Address.findByIdAndDelete(addressObjectId);
  
      // Send success response
      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
      console.log("Error while deleting the address", error);
      res.status(500).json({ message: 'Error deleting address' });
    }
  };
  
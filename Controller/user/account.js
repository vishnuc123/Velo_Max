
import User from "../../Models/User/UserDetailsModel.js";
import { Address } from "../../Models/User/userAddress.js";
import Orders from "../../Models/User/Order.js";


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
        res.status(201).json({ message: 'Address added successfully.' });
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
  

export const getORderProductDetail = async (req,res) =>{
    try {
        console.log(req.params.categoryId);
        
    } catch (error) {
        console.log("error while getting product details");
        
    }
}
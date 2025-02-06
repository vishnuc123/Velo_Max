import dotenv from "dotenv";
import errorHandler from "../../Error-Reporter.js";
dotenv.config();
import Orders from "../../Models/User/Order.js";
import mongoose from "mongoose";
import { fetchCategoryTitles, checkExistingCollections, fetchDocumentsFromCollection } from "../../Utils/User/product.js"; 
import User from "../../Models/User/UserDetailsModel.js";




export const Load_dashboard = async (req, res) => {
  try {
      res.render("Admin/dashboard.ejs");
      
    } catch (error) {
      console.log('error while adding the dashboard',error);
      
    }
  };
  
  
  export const Load_Ecommerce = async (req, res) => {
    try {
      res.render("Admin/ecommerse.ejs");
    } catch (error) {
      console.log("error while getting ecommerce",error);
    }
  };
  

 
  export const getTopTenProducts = async (req, res) => {
    try {
      // Step 1: Aggregate the top 10 products by sales
      const topTenProducts = await Orders.aggregate([
        { $unwind: "$orderedItem" }, // Break down the orderedItem array
        {
          $group: {
            _id: "$orderedItem.productId", // Group by productId
            totalQuantity: { $sum: "$orderedItem.quantity" }, // Sum the quantity sold
            totalRevenue: {
              $sum: {
                $floor: { // Apply Math.floor to remove decimals from the totalPrice calculation
                  $multiply: ["$orderedItem.quantity", "$orderedItem.totalPrice"]
                },
              },
            },
          },
        },
        { $sort: { totalQuantity: -1 } }, // Sort by totalQuantity in descending order
        { $limit: 10 }, // Limit to top 10 products
      ]);
  
      // Step 2: Fetch all available category collections
      const categoryCollections = await fetchCategoryTitles(); // e.g., ["electronics_products", "furniture_products"]
  
      // Step 3: Check for existing collections in the database
      const existingCollections = await checkExistingCollections();
  
      // Step 4: Enrich the top 10 products with details from dynamic collections
      const enrichedProducts = await Promise.all(
        topTenProducts.map(async (product) => {
          for (const collectionName of categoryCollections) {
            // Check if the collection exists in the database
            if (!existingCollections.includes(collectionName)) continue;
  
            // Fetch the product details from the dynamic collection
            const productDetails = await fetchDocumentsFromCollection(collectionName, {
              _id: new mongoose.Types.ObjectId(product._id),
            });
  
            if (productDetails.length > 0) {
              // Return the product data if details are found
              return {
                productId: product._id,
                totalQuantity: product.totalQuantity,
                totalRevenue: product.totalRevenue, // Already calculated without decimals
                productDetails: productDetails[0],
              };
            }
          }
  
          // If no details are found, return the aggregated data without details
          return {
            productId: product._id,
            totalQuantity: product.totalQuantity,
            totalRevenue: product.totalRevenue, // Already calculated without decimals
            productDetails: null, // Indicate missing product details
          };
        })
      );
  
      // Step 5: Return the response
      res.status(200).json({
        success: true,
        data: enrichedProducts,
      });
    } catch (error) {
      console.error("Error fetching top ten products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch top ten products.",
        error: error.message,
      });
    }
  };
  

export const getRecentOrders = async (req, res) => {
  try {
    // Step 1: Fetch the most recent orders
    const recentOrders = await Orders.aggregate([
      { $sort: { orderDate: -1 } }, // Sort by orderDate in descending order
      { $limit: 5 }, // Limit to the 5 most recent orders
      {
        $project: {
          _id: 1,
          userId: 1,
          orderedItem: 1,
          totalAmount: "$finalAmount", // Alias for the total amount
          orderStatus: 1,
          paymentStatus: 1,
          orderDate: 1,
        },
      },
    ]);


    const categoryCollections = await fetchCategoryTitles();
    const existingCollections = await checkExistingCollections(); 

    const enrichedOrders = await Promise.all(
      recentOrders.map(async (order) => {
    
        const user = await User.findById(order.userId);
    
        const firstName = user ? user.firstname : 'Unknown'; 
        const lastName = user ? user.lastname : 'Unknown'; 

   
        const enrichedItems = await Promise.all(
          order.orderedItem.map(async (item) => {
            for (const collectionName of categoryCollections) {
              if (!existingCollections.includes(collectionName)) continue;

              const productDetails = await fetchDocumentsFromCollection(collectionName, {
                _id: new mongoose.Types.ObjectId(item.productId),
              });

              if (productDetails.length > 0) {
             
                return {
                  ...item,
                  productDetails: productDetails[0], 
                  userFirstName: firstName,           
                  userLastName: lastName,         
                };
              }
            }

          
            return {
              ...item,
              productDetails: null,
              userFirstName: firstName,          
              userLastName: lastName,      
            };
          })
        );

       
        return {
          ...order,
          orderedItem: enrichedItems,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedOrders,
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders.",
      error: error.message,
    });
  }
};


export const ledgerBook = async (req, res) => {
  try {
    // Step 1: Fetch all orders
    const orders = await Orders.aggregate([
      { $sort: { orderDate: -1 } }, // Sort by orderDate in descending order
      {
        $project: {
          _id: 1,
          userId: 1,
          orderedItem: 1,
          totalAmount: "$finalAmount", 
          orderDate: 1,
          paymentStatus: 1,
        },
      },
    ]);

    // Step 2: Fetch all dynamic category collections
    const categoryCollections = await fetchCategoryTitles();
    const existingCollections = await checkExistingCollections();

    // Step 3: Enrich orders with user details and product details
    const enrichedLedger = await Promise.all(
      orders.map(async (order) => {
        // Fetch the user information for the current userId
        const user = await User.findById(order.userId);
        const firstName = user ? user.firstname : "Unknown";
        const lastName = user ? user.lastname : "Unknown";

        // Enrich each orderedItem with product details
        const enrichedItems = await Promise.all(
          order.orderedItem.map(async (item) => {
            for (const collectionName of categoryCollections) {
              if (!existingCollections.includes(collectionName)) continue;

              const productDetails = await fetchDocumentsFromCollection(collectionName, {
                _id: new mongoose.Types.ObjectId(item.productId),
              });

              if (productDetails.length > 0) {
                return {
                  ...item,
                  productDetails: productDetails[0],
                };
              }
            }
            // If no details found
            return { ...item, productDetails: null };
          })
        );

        // Return the enriched order
        return {
          orderId: order._id,
          orderDate: order.orderDate,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          user: {
            firstName,
            lastName,
          },
          items: enrichedItems,
        };
      })
    );

    // Step 4: Return the ledger book data
    res.status(200).json({
      success: true,
      data: enrichedLedger,
    });
  } catch (error) {
    console.error("Error generating ledger book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate ledger book.",
      error: error.message,
    });
  }
};


export const getTopCategories = async (req,res) => {
  try {
    
  } catch (error) {
    console.log("error while getting categories",error);
    
  }
}
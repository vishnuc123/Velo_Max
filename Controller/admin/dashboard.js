import dotenv from "dotenv";
import errorHandler from "../../Error-Reporter.js";
dotenv.config();
import Orders from "../../Models/User/Order.js";
import mongoose from "mongoose";
import { fetchCategoryTitles, checkExistingCollections, fetchDocumentsFromCollection } from "../../Utils/User/product.js"; 
import User from "../../Models/User/UserDetailsModel.js";

export const Load_dashboard = async (req, res) => {
  try {
      res.render("Admin/ecommerse.ejs");
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
      const topTenProducts = await Orders.aggregate([
        {
          $match: {
            orderStatus: { $nin: ["Returned", "Cancelled"] }
          }
        },
        { $unwind: "$orderedItem" },
        {
          $group: {
            _id: "$orderedItem.productId",
            totalQuantity: { $sum: "$orderedItem.quantity" },
            totalRevenue: {
              $sum: {
                $floor: {
                  $multiply: ["$orderedItem.quantity", "$orderedItem.totalPrice"]
                },
              },
            },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]);
      
  
      const categoryCollections = await fetchCategoryTitles();
      const existingCollections = await checkExistingCollections();
  
      const enrichedProducts = await Promise.all(
        topTenProducts.map(async (product) => {
          for (const collectionName of categoryCollections) {
            if (!existingCollections.includes(collectionName)) continue;
  
            const productDetails = await fetchDocumentsFromCollection(collectionName, {
              _id: new mongoose.Types.ObjectId(product._id),
            });
  
            if (productDetails.length > 0) {
              return {
                productId: product._id,
                totalQuantity: product.totalQuantity,
                totalRevenue: product.totalRevenue,
                productDetails: productDetails[0],
              };
            }
          }
  
          return {
            productId: product._id,
            totalQuantity: product.totalQuantity,
            totalRevenue: product.totalRevenue,
            productDetails: null,
          };
        })
      );
  
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
    const recentOrders = await Orders.aggregate([
      { $sort: { orderDate: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          userId: 1,
          orderedItem: 1,
          totalAmount: "$finalAmount",
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
    const orders = await Orders.aggregate([
      { $sort: { orderDate: -1 } },
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

    const categoryCollections = await fetchCategoryTitles();
    const existingCollections = await checkExistingCollections();

    const enrichedLedger = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findById(order.userId);
        const firstName = user ? user.firstname : "Unknown";
        const lastName = user ? user.lastname : "Unknown";

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
            return { ...item, productDetails: null };
          })
        );

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

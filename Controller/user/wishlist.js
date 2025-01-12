import mongoose from "mongoose";
import Wishlist from "../../Models/User/whislist.js";

export const getWishlist = async (req,res) => {
    try {
        res.render('User/wishlist.ejs')
    } catch (error) {
        console.log("error while getting whislist",error);
        
    }
}


export const getWishlistProducts = async (req, res) => {
  try {
    const userId = req.session.UserId;

    // Fetch the user's wishlist
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(404).json({ message: "Wishlist is empty." });
    }

    // Fetch product details based on dynamic category collections
    const productDetails = await Promise.all(
      wishlist.items.map(async (item) => {
        const collectionName = item.categoryId; // Category ID corresponds to collection name
        const Collection = mongoose.connection.collection(collectionName);

        // Fetch product from the respective category collection
        const product = await Collection.findOne({ _id: item.productId });
        return product;
      })
    );

    // Filter out any null values (in case some products are not found)
    const filteredProducts = productDetails.filter((product) => product !== null);

    res.status(200).json({ products: filteredProducts });
  } catch (error) {
    console.error("Error while getting wishlist items:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};




export const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.UserId
      const { categoryId, productId } = req.body;
  
      if (!userId || !categoryId || !productId) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Find the user's wishlist
      let wishlist = await Wishlist.findOne({ userId });
  
      if (wishlist) {
        // Check if the product is already in the wishlist
        const itemExists = wishlist.items.some(
          (item) =>
            item.categoryId === categoryId &&
            item.productId.toString() === productId
        );
  
        if (itemExists) {
          return res.status(400).json({ message: "Product already in wishlist." });
        }
  
        // Add the new item to the wishlist
        wishlist.items.push({ categoryId, productId });
      } else {
        // Create a new wishlist for the user
        wishlist = new Wishlist({
          userId,
          items: [{ categoryId, productId }],
        });
      }
  
      // Save the updated or new wishlist
      await wishlist.save();
  
      res.status(200).json({ message: "Product added to wishlist.", wishlist });
    } catch (error) {
      console.error("Error while adding to wishlist:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
import wishlist from "../../Models/User/whislist.js"
import {
  fetchUserWishlist,
  fetchProductDetails,
  addItemToWishlist
} from "../../Utils/User/wishlist.js";

export const getWishlist = async (req, res) => {
  try {
    res.render('User/wishlist.ejs');
  } catch (error) {
    console.error("Error while getting wishlist:", error);
  }
};

export const getWishlistProducts = async (req, res) => {
  try {
    const userId = req.session.UserId;

    const wishlist = await fetchUserWishlist(userId);

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(404).json({ message: "Wishlist is empty." });
    }

    const productDetails = await fetchProductDetails(wishlist.items);

    res.status(200).json({ products: productDetails });
  } catch (error) {
    console.error("Error while getting wishlist items:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.UserId;
    const { categoryId, productId } = req.body;

    if (!userId || !categoryId || !productId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const wishlist = await addItemToWishlist(userId, categoryId, productId);

    res.status(200).json({ message: "Product added to wishlist.", wishlist });
  } catch (error) {
    if (error.message === "Product already in wishlist.") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error while adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getWishlistItems = async (req, res) => {
  try {
      const userId = req.session.UserId;
      
      if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
      }

      // Fetch wishlist items based on the userId
      const wishlistItems = await wishlist.findOne({ userId: userId });

      if (!wishlistItems || wishlistItems.length === 0) {
          return res.status(404).json({ message: 'No wishlist items found' });
      }
      // console.log(wishlistItems);
      

      // Send the wishlist items as a response
      return res.status(200).json({ items: wishlistItems });
  } catch (error) {
      console.error('Error fetching wishlist items:', error);
      return res.status(500).json({ message: 'An error occurred while fetching wishlist items' });
  }
};

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




export const removeFromWishlist = async (req, res, next) => {
    try {

      console.log(req.params);
      
        const productId = req.params.productId;  // Getting the productId from the request body
        console.log("Removing product with ID:", productId);
      
        

        // Find the user's wishlist and remove the item based on the productId
        const result = await wishlist.findOneAndUpdate(
            { userId: req.user._id },  // Assuming the user is authenticated and req.user._id is available
            { $pull: { items: { productId } } },  // Pull the item with the specified productId
            { new: true }  // Return the updated wishlist document
        );

        if (!result) {
            return res.status(404).json({ message: "Wishlist not found or product not in wishlist." });
        }

        // Successfully removed the product from the wishlist
        res.status(200).json({ message: "Product removed from wishlist.", updatedWishlist: result });
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        next(error);  // Pass the error to the error handler middleware
    }
};


export const checkWislist = async (req, res, next) => {
  try {
    const userId = req.session.UserId;

    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    // Get productId from the params
    const { productId } = req.params;

    // Check if productId is provided
    if (!productId) {
      return res.status(400).json({ message: "productId is missing or required" });
    }

    // Find the wishlist for the user
    const wishlistItems = await wishlist.findOne({ userId: userId });

    // Check if the wishlist exists
    if (!wishlistItems) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Check if the product is in the wishlist
    const product = wishlistItems.items.find(item => item.productId === productId);

    // If product is found in wishlistItems, return the wishlistItems with the product
    if (product) {
      return res.status(200).json({ message: "Product is in the wishlistItems", wishlistItems });
    }

    // If product is not in wishlistItems
    return res.status(200).json({ message: "Product is not in the wishlistItems", wishlistItems });

  } catch (error) {
    next(error);
  }
};


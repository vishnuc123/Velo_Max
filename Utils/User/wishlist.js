import mongoose from "mongoose";
import Wishlist from "../../Models/User/whislist.js";

/**
 * Fetches the user's wishlist by userId.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - The user's wishlist.
 */
export const fetchUserWishlist = async (userId) => {
  return await Wishlist.findOne({ userId });
};

/**
 * Fetches product details for the given items from their respective category collections.
 * @param {Array} items - List of items with categoryId and productId.
 * @returns {Promise<Array>} - Array of product details.
 */
export const fetchProductDetails = async (items) => {
  const productDetails = await Promise.all(
    items.map(async (item) => {
      const collectionName = item.categoryId; // Category ID corresponds to collection name
      const Collection = mongoose.connection.collection(collectionName);

      // Fetch product from the respective category collection
      return await Collection.findOne({ _id: item.productId });
    })
  );

  return productDetails.filter((product) => product !== null);
};

/**
 * Adds a product to the user's wishlist.
 * @param {string} userId - The ID of the user.
 * @param {string} categoryId - The category ID of the product.
 * @param {string} productId - The product ID.
 * @returns {Promise<Object>} - The updated or newly created wishlist.
 */
export const addItemToWishlist = async (userId, categoryId, productId) => {
  let wishlist = await fetchUserWishlist(userId);

  if (wishlist) {
    // Check if the product is already in the wishlist
    const itemExists = wishlist.items.some(
      (item) =>
        item.categoryId === categoryId &&
        item.productId.toString() === productId
    );

    if (itemExists) {
      throw new Error("Product already in wishlist.");
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
  return wishlist;
};

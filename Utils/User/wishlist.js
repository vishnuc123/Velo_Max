import mongoose from "mongoose";
import Wishlist from "../../Models/User/whislist.js";


export const fetchUserWishlist = async (userId) => {
  return await Wishlist.findOne({ userId });
};


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

import mongoose from 'mongoose';
import CartModel from '../../Models/User/cart.js';
import user from '../../Models/User/UserDetailsModel.js';
import applyDiscounts, { normalizeCategoryTitle } from "../../Utils/User/activeOffer.js";
import Offer from '../../Models/Admin/offers.js';







export const getCartItems = async (req, res) => {
  try {
    // Extract user ID from the session
    const userId = req.session.UserId;

    // Validate the user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID." });
    }

    // Fetch the user's cart
    const userCart = await CartModel.findOne({ userId });

    if (!userCart || !userCart.items.length) {
      return res.status(200).json({ message: "Your cart is empty.", cartItems: [] });
    }

    // Fetch active offers
    const currentDate = new Date();
    const activeOffers = await Offer.find({
      status: "active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    const detailedCartItems = [];

    // Iterate through cart items and fetch product details dynamically
    for (const item of userCart.items) {
      const { categoryId, productId, quantity, price } = item;

      // Dynamically reference the collection for the product's category
      const CategoryCollection = mongoose.connection.collection(categoryId);

      // Fetch the product details from the category collection
      const product = await CategoryCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });

      if (product) {
        // Check if the product is blocked
        const isBlocked = product.isblocked === true;

        // If the product is not blocked, calculate discounts and add to detailedCartItems
        if (!isBlocked) {
          const normalizedCategoryTitle = normalizeCategoryTitle(categoryId);
          const discountedProduct = applyDiscounts(product, normalizedCategoryTitle, activeOffers);

          detailedCartItems.push({
            categoryId,
            productId,
            quantity,
            price,
            productDetails: discountedProduct, // Include discounted product details
            offers: {
              productOffer: discountedProduct.productOffer || null,
              categoryOffer: discountedProduct.categoryOffer || null,
            },
            isBlocked,
          });
        }
      }
    }

    // Calculate total discounted price of the cart
    const totalDiscountedPrice = detailedCartItems.reduce(
      (total, item) => total + item.productDetails.discountedPrice * item.quantity,
      0
    );

    // Respond with the detailed cart items, including applicable offers
    res.status(200).json({
      message: "Cart items fetched successfully!",
      cartItems: detailedCartItems,
      totalPrice: userCart.totalPrice, // Original total price
      totalDiscountedPrice, // Total discounted price including all applied discounts
    });
  } catch (error) {
    console.error("Error while getting cart items:", error);
    res.status(500).json({
      message: "An error occurred while fetching the cart items.",
    });
  }
};



export const addToCart = async (req, res) => {
  try {
    const userId = req.session.UserId; // Extract user ID from session
    const { quantity, price } = req.body; // Extract data from request body
    const { categoryId, productId } = req.params; // Extract product and category from params

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID." });
    }

    // Validate request body
    if (
      !categoryId ||
      !productId ||
      !quantity ||
      !price ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    // Fetch the product from the dynamic collection
    const dynamicCollection = mongoose.connection.collection(categoryId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const product = await dynamicCollection.findOne({ _id: productObjectId });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const stockAvailable = product.Stock;

    // Check if sufficient stock is available for the requested quantity
    if (stockAvailable < quantity) {
      return res.status(400).json({ message: "Insufficient stock available." });
    }

    // Reduce the stock by 1 for each item added to the cart (as per your requirement)
    const newStock = stockAvailable - quantity;

    // Update the stock in the product collection
    // await dynamicCollection.updateOne(
    //   { _id: productObjectId },
    //   { $set: { Stock: newStock } }
    // );

    // Fetch or create a cart for the user
    let userCart = await CartModel.findOne({ userId });

    if (!userCart) {
      userCart = new CartModel({
        userId,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if the product already exists in the cart
    const existingItemIndex = userCart.items.findIndex(
      (item) =>
        item.categoryId === categoryId &&
        item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // Update the existing item's quantity and price
      userCart.items[existingItemIndex].quantity += quantity;
      userCart.items[existingItemIndex].price = price;
    } else {
      // Add the new item to the cart
      userCart.items.push({
        categoryId,
        productId,
        quantity,
        price,
      });
    }

    // Recalculate the total price
    userCart.totalPrice = userCart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Save the updated cart
    await userCart.save();

    res.status(200).json({
      message: "Item added to cart successfully!",
      cart: userCart,
    });
  } catch (error) {
    console.error("Error while adding to cart:", error);
    res.status(500).json({
      message: "An error occurred while adding the item to the cart.",
    });
  }
};



export const updateCartItems = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.UserId; // Assuming userId is passed in the session
    // console.log(req.body);

    // Validate if the quantity is within the allowable range
    if (quantity < 1 || quantity > 5) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 5' });
    }

    // Fetch the existing cart item to calculate quantity difference
    const existingCartItem = await CartModel.findOne({ userId: userId, "items.productId": productId });

    if (!existingCartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Find the specific item in the cart
    const itemIndex = existingCartItem.items.findIndex(item => item.productId.toString() === productId);
    const oldQuantity = existingCartItem.items[itemIndex].quantity; // Current quantity in the cart
    const quantityDifference = quantity - oldQuantity; // Positive if increasing, negative if decreasing

    // Fetch the categoryId from the item
    const categoryId = existingCartItem.items[itemIndex]?.categoryId;

    if (!categoryId) {
      console.error("CategoryId not found in cart item");
      return res.status(404).json({ message: 'CategoryId not found' });
    }

    // Access the collection dynamically using categoryId
    const dynamicCollection = mongoose.connection.collection(categoryId);

    // Convert productId to ObjectId using `new` keyword
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Fetch the product details to check stock
    const productDetail = await dynamicCollection.findOne({ _id: productObjectId });

    if (!productDetail) {
      return res.status(404).json({ message: 'Product not found in the specified category' });
    }

    const oldStock = productDetail.Stock; // Assuming 'Stock' is the correct field in your database

    // Check if the stock is valid
    const newStock = oldStock - quantityDifference;

    if (newStock < 0 && quantityDifference > 0) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Update the cart item with the new quantity
    existingCartItem.items[itemIndex].quantity = quantity;

    // Calculate the total price of all items in the cart
    let totalPrice = 0;
    existingCartItem.items.forEach(item => {
      totalPrice += item.quantity * item.price; // Calculate total based on price * quantity
    });

    // Update the cart with the total price
    existingCartItem.totalPrice = totalPrice;
    await existingCartItem.save();

    // Return the updated cart item and product details
    return res.status(200).json({
      message: 'Cart updated successfully. Stock is valid.',
      updatedCartItem: existingCartItem,
      productDetail: productDetail,
      totalPrice: totalPrice,
    });

  } catch (error) {
    console.error("Error while updating the cart:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};





export const removeCartItem = async (req, res) => {
  try {
    // console.log(req.body);

    // Step 1: Extract productId from the request body
    const productIdreq = req.body.itemId;
    const productId = new mongoose.Types.ObjectId(productIdreq);

    // Step 2: Fetch the cart item using productId (now considered as itemId)
    const cartItem = await CartModel.findOne({ 'items.productId': productId });
    // console.log(cartItem);

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in the cart." });
    }

    // Get the index of the product in the cart items
    const itemIndex = cartItem.items.findIndex(item => item.productId.toString() === productId.toString());
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in the cart." });
    }

    // Fetch quantity to restore from the cart
    const quantityToRestore = cartItem.items[itemIndex].quantity;

    // Step 3: Fetch the categoryId from the cart to dynamically find the collection
    const categoryId = cartItem.items[itemIndex].categoryId;

    if (!categoryId) {
      console.error("CategoryId not found in cart details");
      return res.status(404).json({ message: 'CategoryId not found' });
    }

    // Dynamically access the collection using categoryId
    const dynamicCollection = mongoose.connection.collection(categoryId);

    // Convert productId to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Step 4: Fetch the product details to update stock
    const productDetail = await dynamicCollection.findOne({ _id: productObjectId });

    if (!productDetail) {
      return res.status(404).json({ message: 'Product not found in the specified category' });
    }

    // Step 5: Calculate the new stock and update it
    const newStock = productDetail.Stock + quantityToRestore;  // Add the quantity back to stock

    // Update the stock in the product collection
    await dynamicCollection.updateOne(
      { _id: productObjectId },
      { $set: { Stock: newStock } }
    );

    // Step 6: Remove the item from the cart
    cartItem.items.splice(itemIndex, 1);  // Remove the product from the items array

    // Save the updated cart
    await cartItem.save();

    // Step 7: Respond with success or failure
    res.status(200).json({ message: "Item removed from cart successfully.", cartItem });

  } catch (error) {
    console.error("Error while deleting the item from the cart:", error);
    res.status(500).json({ message: "Failed to remove item from the cart.", error });
  }
};





export const getcartCheckout = async (req,res) => {
  try {
    
    res.render('User/cartCheckout.ejs',)
  } catch (error) {
    console.log("error while getting cart checkout",error);
    
  }
}

export const cartItems = async (req, res) => {
  try {
    // Extract user ID from the session
    const userId = req.session.UserId;

    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID." });
    }

    // Fetch the cart items for the user
    const userCart = await CartModel.findOne({ userId });

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.status(200).json({ message: "Your cart is empty.", cartItems: [] });
    }

    // Fetch active offers
    const currentDate = new Date();
    const activeOffers = await Offer.find({
      status: "active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    // Prepare the final response by processing cart items
    const detailedCartItemsPromises = userCart.items.map(async (cartItem) => {
      const { categoryId, productId, quantity, price } = cartItem;

      // Dynamically reference the category collection
      const CategoryCollection = mongoose.connection.collection(categoryId);

      // Find the product in the specific category collection
      const product = await CategoryCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });

      if (product) {
        // Check if the product is blocked
        const isBlocked = product.isblocked === true;

        // If the product is not blocked, calculate discounts and return details
        if (!isBlocked) {
          const normalizedCategoryTitle = normalizeCategoryTitle(categoryId);
          const discountedProduct = applyDiscounts(product, normalizedCategoryTitle, activeOffers);

          return {
            categoryId,
            productId,
            quantity,
            price,
            productDetails: discountedProduct, // Include discounted product details
            offers: {
              productOffer: discountedProduct.productOffer || null,
              categoryOffer: discountedProduct.categoryOffer || null,
            },
            isBlocked,
          };
        }
      }

      return null; // Skip the product if blocked or not found
    });

    // Wait for all detailed items to resolve and filter out null values
    const detailedCartItems = (await Promise.all(detailedCartItemsPromises)).filter(Boolean);

    // Calculate the total discounted price of the cart
    const totalDiscountedPrice = detailedCartItems.reduce(
      (total, item) => total + item.productDetails.discountedPrice * item.quantity,
      0
    );

    res.status(200).json({
      message: "Cart items fetched successfully!",
      cartItems: detailedCartItems,
      totalPrice: userCart.totalPrice, // Original total price
      totalDiscountedPrice, // Total discounted price including all applied discounts
    });
  } catch (error) {
    console.error("Error while getting cart items:", error);
    res.status(500).json({
      message: "An error occurred while fetching the cart items.",
    });
  }
};




export const getProductDetails = async (req, res) => {
  try {
    const { categoryId, productId } = req.params;

    const dynamicCollection = mongoose.connection.collection(categoryId);

    // Convert productId to ObjectId using `new` keyword
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const productDetail = await dynamicCollection.findOne({ _id: productObjectId });

    if (!productDetail) {
      return res.status(404).json({ message: 'Product not found in the specified category' });
    }

    // Check if the product is blocked
    if (productDetail.isblocked) {
      return res.status(403).json({ message: 'This product is blocked and cannot be viewed.' });
    }

    // Return product details if not blocked
    res.status(200).json({ productData: productDetail });

  } catch (error) {
    console.log("Error while getting product details:", error);
    res.status(500).json({ message: 'An error occurred while fetching the product details.' });
  }
};



  export const getCartCollectionData = async (req,res) => {
    try {

      const userId = req.session.UserId

      const cartData = await CartModel.find({userId:userId})
      res.status(200).json({cartData:cartData})

    } catch (error) {
      console.log("error while getting data from the cart collection");
      
    }
  }


  export const getCartDetailedPage = async (req,res) => {
    try {
      res.render('User/cartDetail.ejs')
    } catch (error) {
      console.log("error while getting cart detailed page");
      
    }
  }
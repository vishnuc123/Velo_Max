import mongoose from 'mongoose';
import CartModel from '../../Models/User/cart.js';




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

    const detailedCartItems = [];

    // Iterate through cart items and fetch product details dynamically
    for (const item of userCart.items) {
      const { categoryId, productId, quantity, price } = item;

      // Dynamically reference the collection for the product's category
      const CategoryCollection = mongoose.connection.collection(categoryId);

      // Fetch the product details from the category collection
      const product = await CategoryCollection.findOne({ _id: new mongoose.Types.ObjectId(productId) });

      if (product) {
        detailedCartItems.push({
          categoryId,
          productId,
          quantity,
          price,
          productDetails: product, // Include detailed product information
        });
      }
    }

    // Respond with the detailed cart items
    res.status(200).json({
      message: "Cart items fetched successfully!",
      cartItems: detailedCartItems,
      totalPrice: userCart.totalPrice, // Include total price from the cart
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
    const  userId  = req.session.UserId; // Extract user ID from session
    const { quantity, price } = req.body; // Extract data from request body
    const {categoryId, productId} = req.params;

    // console.log(req.body);
    // console.log(req.params);
    

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
    // console.log(existingCartItem);

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

    // console.log(`CategoryId (Collection Name): ${categoryId}`);

    // Access the collection dynamically using categoryId
    const dynamicCollection = mongoose.connection.collection(categoryId);

    // Convert productId to ObjectId using `new` keyword
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Fetch the product details to update stock
    const productDetail = await dynamicCollection.findOne({ _id: productObjectId });

    if (!productDetail) {
      return res.status(404).json({ message: 'Product not found in the specified category' });
    }

    const oldStock = productDetail.Stock; // Assuming 'Stock' is the correct field in your database

    // Calculate the new stock
    const newStock = oldStock - quantityDifference;

    if (newStock < 0) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Update the stock in the product collection
    await dynamicCollection.updateOne(
      { _id: productObjectId },
      { $set: { Stock: newStock } }
    );

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
      message: 'Cart and stock updated successfully',
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
    console.log(req.body);
    
    const itemId = req.body.itemId;

    // Step 1: Fetch the cart item to get the quantity
    const cartItem = await CartModel.findOne({ productId: itemId });

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in the cart." });
    }

    const quantityToRestore = cartItem.quantity;  // Get the quantity that was in the cart

    // Step 2: Fetch the product details to get the current stock
    const cartDetail = await CartModel.find({ productId: itemId });
    const categoryId = cartDetail[0]?.categoryId;

    if (!categoryId) {
      console.error("CategoryId not found in cart details");
      return res.status(404).json({ message: 'CategoryId not found' });
    }

    // Access the collection dynamically using categoryId
    const dynamicCollection = mongoose.connection.collection(categoryId);

    // Convert productId to ObjectId using `new` keyword
    const productObjectId = new mongoose.Types.ObjectId(itemId);

    // Step 3: Fetch the product details to update stock
    const productDetail = await dynamicCollection.findOne({ _id: productObjectId });

    if (!productDetail) {
      return res.status(404).json({ message: 'Product not found in the specified category' });
    }

    // Step 4: Calculate the new stock and update it
    const newStock = productDetail.Stock + quantityToRestore;  // Add back the quantity that was in the cart

    // Update the stock in the product collection
    await dynamicCollection.updateOne(
      { _id: productObjectId },
      { $set: { Stock: newStock } } // Ensure that 'Stock' matches the field name in your DB
    );

    // Step 5: Remove the item from the cart
    const deletedItem = await CartModel.findOneAndDelete({ productId: itemId });

    // Step 6: Return the success response
    if (deletedItem) {
      res.status(200).json({ message: "Item removed from cart successfully.", deletedItem });
    } else {
      res.status(404).json({ message: "Item not found in the cart." });
    }

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
    const cart = await CartModel.findOne({ userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({ message: "Your cart is empty.", cartItems: [] });
    }

    // Prepare the final response
    const detailedCartItemsPromises = cart.items.map(async (cartItem) => {
      const { categoryId, productId, quantity, price } = cartItem;

      // Dynamically reference the category collection
      const CategoryCollection = mongoose.connection.collection(categoryId);

      // Find the product in the specific category collection
      const product = await CategoryCollection.findOne({ _id: productId });

      if (product) {
        return {
          categoryId,
          productId,
          product,
          quantity,
          price,
          totalPrice: price * quantity, // Calculate total price for the item
        };
      }
      return null; // Skip the product if not found
    });

    const detailedCartItems = (await Promise.all(detailedCartItemsPromises)).filter(Boolean);

    res.status(200).json({
      message: "Cart items fetched successfully!",
      cartItems: detailedCartItems,
      totalPrice: cart.totalPrice, // Include the total price of the cart
    });
  } catch (error) {
    console.error("Error while getting cart items:", error);
    res.status(500).json({
      message: "An error occurred while fetching the cart items.",
    });
  }
};



  export const getProductDetails = async (req,res) => {
    try {
      const {categoryId, productId} = req.params

      const dynamicCollection = mongoose.connection.collection(categoryId);

      // Convert productId to ObjectId using `new` keyword
      const productObjectId = new mongoose.Types.ObjectId(productId);

      const productDetail = await dynamicCollection.findOne({ _id: productObjectId });

      if (!productDetail) {
        return res.status(404).json({ message: 'Product not found in the specified category' });
      }
      // console.log(productDetail)
      
      res.status(201).json({productData:productDetail})
      
    } catch (error) {
      console.log("error while getting product details",error);
      
    }
  }
import mongoose from 'mongoose';
import CartModel from '../../Models/User/cart.js';


export const getCartItems = async (req, res) => {
  try {
    // Extract user ID from the session
    const userId = req.session.UserId;

    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID." });
    }

    // Fetch the cart items for the user
    const cartItems = await CartModel.find({ userId });

    if (!cartItems.length) {
      return res.status(200).json({ message: "Your cart is empty.", cartItems: [] });
    }

    // Prepare the final response
    const detailedCartItems = [];

    for (const cartItem of cartItems) {
      const { categoryId, productId } = cartItem;

      // Dynamically reference the category collection
      const CategoryCollection = mongoose.connection.collection(categoryId);

      // Find the product in the specific category collection
      const product = await CategoryCollection.findOne({ _id: productId });

      if (product) {
        detailedCartItems.push({
          categoryId,
          productId,
          product,
          cartItem
        });
      }
    }

    res.status(200).json({
      message: "Cart items fetched successfully!",
      cartItems: detailedCartItems,
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
    const { categoryId, productId } = req.params;
    const userId = req.session.UserId;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ message: "Invalid User ID or Product ID." });
    }

    // Check if the item already exists in the cart
    const existingCartItem = await CartModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      categoryId,
      productId: new mongoose.Types.ObjectId(productId),
    });

    if (existingCartItem) {
      return res.status(200).json({
        message: "Product already exists in the cart.",
        cartItems: await CartModel.find({ userId: new mongoose.Types.ObjectId(userId) }),
      });
    }

    // Add to cart
    const cart = new CartModel({
      categoryId,
      productId: new mongoose.Types.ObjectId(productId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    await cart.save();

    // Fetch all cart items for the user
    const cartItems = await CartModel.find({ userId: new mongoose.Types.ObjectId(userId) });

    // Respond with updated cart data
    res.status(201).json({
      message: "Product added to cart successfully!",
      cartItems,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "An error occurred while adding the product to the cart." });
  }
};


export const updateCartItems = async (req, res) => {
  try {
    const { productId, quantity, price } = req.body;

    console.log(req.body);

    // Validate if the quantity is within the allowable range
    if (quantity < 1 || quantity > 5) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 5' });
    }

    // Fetch the existing cart item to calculate quantity difference
    const existingCartItem = await CartModel.findOne({ productId: productId });

    if (!existingCartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const oldQuantity = existingCartItem.quantity; // This should be the quantity from the cart, not the product stock
    const quantityDifference = quantity - oldQuantity; // Positive if increasing, negative if decreasing

    // Fetch cart details to retrieve categoryId
    const cartDetail = await CartModel.find({ productId: productId });
    console.log(cartDetail);

    const categoryId = cartDetail[0]?.categoryId;

    if (!categoryId) {
      console.error("CategoryId not found in cart details");
      return res.status(404).json({ message: 'CategoryId not found' });
    }

    console.log(`CategoryId (Collection Name): ${categoryId}`);

    // Access the collection dynamically using categoryId
    const dynamicCollection = mongoose.connection.collection(categoryId);

    // Convert productId to ObjectId using `new` keyword
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Fetch the product details to update stock
    const productDetail = await dynamicCollection.findOne({ _id: productObjectId });

    if (!productDetail) {
      return res.status(404).json({ message: 'Product not found in the specified category' });
    }

    console.log(`Product Detail:`, productDetail);

    const oldStock = productDetail.Stock; // Assuming 'Stock' is the correct field in your database

    // Calculate the new stock
    const newStock = oldStock - quantityDifference;

    if (newStock < 0) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Update the stock in the product collection
    await dynamicCollection.updateOne(
      { _id: productObjectId },
      { $set: { Stock: newStock } } // Ensure that 'Stock' matches the field name in your DB
    );

    // Fetch the updated product details
    const updatedProductDetail = await dynamicCollection.findOne({ _id: productObjectId });

    // Update the cart item with the new quantity and price
    const updatedCartItem = await CartModel.findOneAndUpdate(
      { productId: productId },
      { quantity: quantity, price: price },
      { new: true }
    );

    // Return the updated cart item and product details
    return res.status(200).json({
      message: 'Cart and stock updated successfully',
      updatedCartItem,
      productDetail: updatedProductDetail,
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

export const cartItems = async (req,res) => {
    try {
      // Extract user ID from the session
      const userId = req.session.UserId;
  
      // Validate user ID
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid or missing User ID." });
      }
  
      // Fetch the cart items for the user
      const cartItems = await CartModel.find({ userId });
  
      if (!cartItems.length) {
        return res.status(200).json({ message: "Your cart is empty.", cartItems: [] });
      }
  
      // Prepare the final response
      const detailedCartItems = [];
  
      for (const cartItem of cartItems) {
        const { categoryId, productId } = cartItem;
  
        // Dynamically reference the category collection
        const CategoryCollection = mongoose.connection.collection(categoryId);
  
        // Find the product in the specific category collection
        const product = await CategoryCollection.findOne({ _id: productId });
  
        if (product) {
          detailedCartItems.push({
            categoryId,
            productId,
            product,
            cartItem
          });
        }
      }
  
      res.status(200).json({
        message: "Cart items fetched successfully!",
        cartItems: detailedCartItems,
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
      console.log(productDetail);
      
      res.status(201).json({productData:productDetail})
      
    } catch (error) {
      console.log("error while getting product details",error);
      
    }
  }
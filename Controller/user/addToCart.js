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
    

    // Validate if the quantity is within the allowable range (for example, between 1 and 5)
    if (quantity < 1 || quantity > 5) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 5' });
    }

    // Find and update the cart item by productId and update its quantity
    const updatedCartItem = await CartModel.findOneAndUpdate(
      { productId: productId },
      {quantity:quantity,price:price} ,// filter by productId
      { new: true } // return the updated document
    );
    
    // If the cart item is not found
    if (!updatedCartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Return the updated cart item or a success message
    return res.status(200).json({ message: 'Cart updated successfully', updatedCartItem });

  } catch (error) {
    console.log("Error while updating the cart", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const removeCartItem = async (req, res) => {
  try {
    console.log(req.body);
    
    
    const itemId = req.body.itemId;
    

    // Find and delete the document
    const deletedItem = await CartModel.findOneAndDelete({ productId: itemId });

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